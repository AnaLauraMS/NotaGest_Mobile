import { DatabaseManager } from '../../core/database/databaseManager';
import { SyncAction, SyncEntityType, SyncStatus } from '../../core/constants/enums';
import { InvoiceLocalEntity, InvoiceRow, SyncQueueItem, SyncQueueRow } from './types';
import { InvoiceResponse } from './schemas';

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

function mapRowToEntity(row: InvoiceRow): InvoiceLocalEntity {
  return {
    id: row.id,
    title: row.title,
    value: row.value,
    purchaseDate: row.purchase_date,
    propertyId: row.property_id,
    propertyName: row.property_name,
    category: row.category,
    subcategory: row.subcategory,
    observation: row.observation,
    filePath: row.file_path,
    syncStatus: row.sync_status as SyncStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapQueueRowToItem(row: SyncQueueRow): SyncQueueItem {
  return {
    id: row.id,
    entityType: row.entity_type as SyncEntityType,
    entityId: row.entity_id,
    action: row.action as SyncAction,
    payload: row.payload,
    attempts: row.attempts,
    lastError: row.last_error,
    createdAt: row.created_at,
  };
}

export class InvoiceLocalRepository {
  public static async saveInvoice(
    invoice: InvoiceLocalEntity,
    action?: SyncAction
  ): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR REPLACE INTO invoices (
          id, title, value, purchase_date, property_id, property_name,
          category, subcategory, observation, file_path, sync_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        invoice.id,
        invoice.title,
        invoice.value,
        invoice.purchaseDate,
        invoice.propertyId ?? null,
        invoice.propertyName ?? null,
        invoice.category,
        invoice.subcategory,
        invoice.observation ?? null,
        invoice.filePath ?? null,
        invoice.syncStatus,
        invoice.createdAt,
        invoice.updatedAt
      );

      if (action) {
        const queueId = generateUUID();
        const payload = JSON.stringify(invoice);
        await db.runAsync(
          `INSERT INTO sync_queue (
            id, entity_type, entity_id, action, payload, attempts, created_at
          ) VALUES (?, ?, ?, ?, ?, 0, ?)`,
          queueId,
          SyncEntityType.Invoice,
          invoice.id,
          action,
          payload,
          new Date().toISOString()
        );
      }
    });
  }

  public static async saveInvoicesFromRemote(remoteInvoices: InvoiceResponse[]): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const remote of remoteInvoices) {
        const existing = await db.getFirstAsync<InvoiceRow>(
          'SELECT sync_status FROM invoices WHERE id = ?',
          remote._id
        );

        if (
          existing &&
          (existing.sync_status === SyncStatus.PendingCreate ||
            existing.sync_status === SyncStatus.PendingUpdate ||
            existing.sync_status === SyncStatus.PendingDelete)
        ) {
          continue;
        }

        const propertyId =
          typeof remote.property === 'object' && remote.property !== null
            ? remote.property._id
            : typeof remote.property === 'string'
            ? remote.property
            : null;

        const propertyName =
          typeof remote.property === 'object' && remote.property !== null
            ? remote.property.nome
            : null;

        await db.runAsync(
          `INSERT OR REPLACE INTO invoices (
            id, title, value, purchase_date, property_id, property_name,
            category, subcategory, observation, file_path, sync_status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          remote._id,
          remote.title,
          remote.value,
          remote.purchaseDate,
          propertyId,
          propertyName,
          remote.category,
          remote.subcategory,
          remote.observation || null,
          remote.filePath || null,
          SyncStatus.Synced,
          remote.createdAt || now,
          now
        );
      }
    });
  }

  public static async getInvoices(propertyId?: string): Promise<InvoiceLocalEntity[]> {
    const db = await DatabaseManager.getDatabase();
    let rows: InvoiceRow[];

    if (propertyId && propertyId.trim() !== '') {
      rows = await db.getAllAsync<InvoiceRow>(
        `SELECT * FROM invoices 
         WHERE sync_status != ? AND property_id = ? 
         ORDER BY purchase_date DESC`,
        SyncStatus.PendingDelete,
        propertyId
      );
    } else {
      rows = await db.getAllAsync<InvoiceRow>(
        `SELECT * FROM invoices 
         WHERE sync_status != ? 
         ORDER BY purchase_date DESC`,
        SyncStatus.PendingDelete
      );
    }

    return rows.map(mapRowToEntity);
  }

  public static async getInvoiceById(id: string): Promise<InvoiceLocalEntity | null> {
    const db = await DatabaseManager.getDatabase();
    const row = await db.getFirstAsync<InvoiceRow>(
      'SELECT * FROM invoices WHERE id = ?',
      id
    );
    return row ? mapRowToEntity(row) : null;
  }

  public static async deleteInvoiceLocally(id: string): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    const existing = await db.getFirstAsync<InvoiceRow>(
      'SELECT sync_status FROM invoices WHERE id = ?',
      id
    );

    if (!existing) {
      return;
    }

    await db.withTransactionAsync(async () => {
      if (existing.sync_status === SyncStatus.PendingCreate) {
        await db.runAsync('DELETE FROM invoices WHERE id = ?', id);
        await db.runAsync(
          'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
          id,
          SyncEntityType.Invoice
        );
      } else {
        const now = new Date().toISOString();
        await db.runAsync(
          'UPDATE invoices SET sync_status = ?, updated_at = ? WHERE id = ?',
          SyncStatus.PendingDelete,
          now,
          id
        );
        const queueId = generateUUID();
        await db.runAsync(
          `INSERT INTO sync_queue (
            id, entity_type, entity_id, action, payload, attempts, created_at
          ) VALUES (?, ?, ?, ?, ?, 0, ?)`,
          queueId,
          SyncEntityType.Invoice,
          id,
          SyncAction.Delete,
          JSON.stringify({ id }),
          now
        );
      }
    });
  }

  public static async markAsSynced(localId: string, remoteId?: string): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      if (remoteId && remoteId !== localId) {
        await db.runAsync(
          'UPDATE invoices SET id = ?, sync_status = ?, updated_at = ? WHERE id = ?',
          remoteId,
          SyncStatus.Synced,
          now,
          localId
        );
        await db.runAsync(
          'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
          localId,
          SyncEntityType.Invoice
        );
      } else {
        await db.runAsync(
          'UPDATE invoices SET sync_status = ?, updated_at = ? WHERE id = ?',
          SyncStatus.Synced,
          now,
          localId
        );
        await db.runAsync(
          'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
          localId,
          SyncEntityType.Invoice
        );
      }
    });
  }

  public static async getPendingSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await DatabaseManager.getDatabase();
    const rows = await db.getAllAsync<SyncQueueRow>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );
    return rows.map(mapQueueRowToItem);
  }

  public static async removeSyncQueueItem(queueId: string): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', queueId);
  }

  public static async updateSyncQueueAttempt(queueId: string, error: string): Promise<void> {
    const db = await DatabaseManager.getDatabase();
    await db.runAsync(
      'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
      error,
      queueId
    );
  }
}
