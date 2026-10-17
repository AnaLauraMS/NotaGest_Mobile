import * as Network from 'expo-network';
import { InvoiceLocalRepository } from '../invoice/invoiceLocalRepository';
import { InvoiceService } from '../invoice/invoiceService';
import { SyncAction, SyncEntityType, SyncStatus } from '../../core/constants/enums';
import { CreateInvoiceRequest, InvoiceResponse } from '../invoice/schemas';
import { InvoiceLocalEntity } from '../invoice/types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class SyncService {
  private static isSyncing = false;

  public static async isOnline(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync();
      return Boolean(state.isConnected && state.isInternetReachable !== false);
    } catch {
      return false;
    }
  }

  public static async syncPendingQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    const online = await this.isOnline();
    if (!online) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const queue = await InvoiceLocalRepository.getPendingSyncQueue();

      for (const item of queue) {
        try {
          if (item.entityType === SyncEntityType.Invoice) {
            if (item.action === SyncAction.Create) {
              const invoice = JSON.parse(item.payload) as InvoiceLocalEntity;
              const createPayload: CreateInvoiceRequest = {
                title: invoice.title,
                value: invoice.value,
                purchaseDate: invoice.purchaseDate,
                property: invoice.propertyId || '',
                category: invoice.category,
                subcategory: invoice.subcategory,
                observation: invoice.observation || '',
                filePath: invoice.filePath || '',
              };
              const created = await InvoiceService.createInvoice(createPayload);
              await InvoiceLocalRepository.markAsSynced(item.entityId, created._id);
              synced++;
            } else if (item.action === SyncAction.Delete) {
              await InvoiceService.deleteInvoice(item.entityId);
              await InvoiceLocalRepository.removeSyncQueueItem(item.id);
              synced++;
            }
          }
        } catch (err: any) {
          if (item.action === SyncAction.Delete && err?.response?.status === 404) {
            await InvoiceLocalRepository.removeSyncQueueItem(item.id);
            synced++;
            continue;
          }

          failed++;
          const errorMessage = err?.message || 'Sync error';
          await InvoiceLocalRepository.updateSyncQueueAttempt(item.id, errorMessage);
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { synced, failed };
  }

  public static async pullRemoteInvoices(propertyId?: string): Promise<InvoiceResponse[]> {
    const online = await this.isOnline();
    if (!online) {
      return [];
    }

    try {
      const remoteInvoices = await InvoiceService.getInvoices(propertyId);
      await InvoiceLocalRepository.saveInvoicesFromRemote(remoteInvoices);
      return remoteInvoices;
    } catch {
      return [];
    }
  }

  public static async syncAll(propertyId?: string): Promise<InvoiceLocalEntity[]> {
    await this.syncPendingQueue();
    await this.pullRemoteInvoices(propertyId);
    return InvoiceLocalRepository.getInvoices(propertyId);
  }

  public static async saveInvoiceOfflineFirst(
    payload: CreateInvoiceRequest,
    propertyName?: string
  ): Promise<InvoiceLocalEntity> {
    const now = new Date().toISOString();
    const localId = generateUUID();

    const localInvoice: InvoiceLocalEntity = {
      id: localId,
      title: payload.title,
      value: payload.value,
      purchaseDate: payload.purchaseDate,
      propertyId: payload.property,
      propertyName: propertyName ?? null,
      category: payload.category,
      subcategory: payload.subcategory,
      observation: payload.observation || null,
      filePath: payload.filePath || null,
      syncStatus: SyncStatus.PendingCreate,
      createdAt: now,
      updatedAt: now,
    };

    await InvoiceLocalRepository.saveInvoice(localInvoice, SyncAction.Create);
    const online = await this.isOnline();
    if (online) {
      await this.syncPendingQueue();
    }

    return localInvoice;
  }

  public static async deleteInvoiceOfflineFirst(id: string): Promise<void> {
    await InvoiceLocalRepository.deleteInvoiceLocally(id);
    const online = await this.isOnline();
    if (online) {
      await this.syncPendingQueue();
    }
  }

  public static getSyncingStatus(): boolean {
    return this.isSyncing;
  }

  public static setSyncingStatus(status: boolean): void {
    this.isSyncing = status;
  }
}
