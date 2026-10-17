import * as Network from 'expo-network';
import { SyncService } from './syncService';
import { InvoiceLocalRepository } from '../invoice/invoiceLocalRepository';
import { InvoiceService } from '../invoice/invoiceService';
import { SyncAction, SyncEntityType, SyncStatus } from '../../core/constants/enums';
import { InvoiceLocalEntity, SyncQueueItem } from '../invoice/types';
import { CreateInvoiceRequest, InvoiceResponse } from '../invoice/schemas';

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('../invoice/invoiceLocalRepository', () => ({
  InvoiceLocalRepository: {
    getPendingSyncQueue: jest.fn(),
    markAsSynced: jest.fn(),
    removeSyncQueueItem: jest.fn(),
    updateSyncQueueAttempt: jest.fn(),
    saveInvoicesFromRemote: jest.fn(),
    getInvoices: jest.fn(),
    saveInvoice: jest.fn(),
    deleteInvoiceLocally: jest.fn(),
  },
}));

jest.mock('../invoice/invoiceService', () => ({
  InvoiceService: {
    createInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
    getInvoices: jest.fn(),
  },
}));

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SyncService.setSyncingStatus(false);
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  const sampleEntity: InvoiceLocalEntity = {
    id: 'local-1',
    title: 'Madeira',
    value: 200,
    purchaseDate: '2026-10-15',
    propertyId: 'prop-1',
    propertyName: 'Casa Centro',
    category: 'Construção',
    subcategory: 'Estrutura',
    observation: 'Obs',
    filePath: 'file:///path.jpg',
    syncStatus: SyncStatus.PendingCreate,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  };

  const sampleCreateQueueItem: SyncQueueItem = {
    id: 'queue-1',
    entityType: SyncEntityType.Invoice,
    entityId: 'local-1',
    action: SyncAction.Create,
    payload: JSON.stringify(sampleEntity),
    attempts: 0,
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  const sampleDeleteQueueItem: SyncQueueItem = {
    id: 'queue-2',
    entityType: SyncEntityType.Invoice,
    entityId: 'remote-1',
    action: SyncAction.Delete,
    payload: JSON.stringify({ id: 'remote-1' }),
    attempts: 0,
    createdAt: '2026-10-15T10:05:00.000Z',
  };

  describe('isOnline', () => {
    it('should return true when connected and internet reachable', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const online = await SyncService.isOnline();
      expect(online).toBe(true);
    });

    it('should return false when isConnected is false', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: true,
      });

      const online = await SyncService.isOnline();
      expect(online).toBe(false);
    });

    it('should return false when isInternetReachable is false', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
      });

      const online = await SyncService.isOnline();
      expect(online).toBe(false);
    });

    it('should return false when getNetworkStateAsync throws an error', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockRejectedValue(new Error('Network error'));

      const online = await SyncService.isOnline();
      expect(online).toBe(false);
    });
  });

  describe('syncPendingQueue', () => {
    it('should return immediately if sync is already running', async () => {
      SyncService.setSyncingStatus(true);

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 0, failed: 0 });
      expect(InvoiceLocalRepository.getPendingSyncQueue).not.toHaveBeenCalled();
    });

    it('should return immediately if device is offline', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 0, failed: 0 });
      expect(InvoiceLocalRepository.getPendingSyncQueue).not.toHaveBeenCalled();
    });

    it('should sync create actions successfully', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        sampleCreateQueueItem,
      ]);
      (InvoiceService.createInvoice as jest.Mock).mockResolvedValue({
        _id: 'mongo-id-123',
        title: sampleEntity.title,
      });

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 1, failed: 0 });
      expect(InvoiceService.createInvoice).toHaveBeenCalledWith({
        title: sampleEntity.title,
        value: sampleEntity.value,
        purchaseDate: sampleEntity.purchaseDate,
        property: sampleEntity.propertyId,
        category: sampleEntity.category,
        subcategory: sampleEntity.subcategory,
        observation: sampleEntity.observation,
        filePath: sampleEntity.filePath,
      });
      expect(InvoiceLocalRepository.markAsSynced).toHaveBeenCalledWith(
        sampleCreateQueueItem.entityId,
        'mongo-id-123'
      );
    });

    it('should fallback property, observation, and filePath if empty in payload', async () => {
      const minimalEntity = { ...sampleEntity, propertyId: null, observation: null, filePath: null };
      const itemWithMinimalEntity: SyncQueueItem = {
        ...sampleCreateQueueItem,
        payload: JSON.stringify(minimalEntity),
      };

      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        itemWithMinimalEntity,
      ]);
      (InvoiceService.createInvoice as jest.Mock).mockResolvedValue({ _id: 'remote-min' });

      await SyncService.syncPendingQueue();

      expect(InvoiceService.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          property: '',
          observation: '',
          filePath: '',
        })
      );
    });

    it('should sync delete actions successfully', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        sampleDeleteQueueItem,
      ]);
      (InvoiceService.deleteInvoice as jest.Mock).mockResolvedValue(undefined);

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 1, failed: 0 });
      expect(InvoiceService.deleteInvoice).toHaveBeenCalledWith(sampleDeleteQueueItem.entityId);
      expect(InvoiceLocalRepository.removeSyncQueueItem).toHaveBeenCalledWith(
        sampleDeleteQueueItem.id
      );
    });

    it('should consider delete as synced when server returns 404', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        sampleDeleteQueueItem,
      ]);
      (InvoiceService.deleteInvoice as jest.Mock).mockRejectedValue({
        response: { status: 404 },
        message: 'Not found',
      });

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 1, failed: 0 });
      expect(InvoiceLocalRepository.removeSyncQueueItem).toHaveBeenCalledWith(
        sampleDeleteQueueItem.id
      );
    });

    it('should update attempt count and error message on sync failure', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        sampleCreateQueueItem,
      ]);
      (InvoiceService.createInvoice as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 0, failed: 1 });
      expect(InvoiceLocalRepository.updateSyncQueueAttempt).toHaveBeenCalledWith(
        sampleCreateQueueItem.id,
        'Network request failed'
      );
    });

    it('should fallback to default error message if error object lacks message', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        sampleCreateQueueItem,
      ]);
      (InvoiceService.createInvoice as jest.Mock).mockRejectedValue({});

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 0, failed: 1 });
      expect(InvoiceLocalRepository.updateSyncQueueAttempt).toHaveBeenCalledWith(
        sampleCreateQueueItem.id,
        'Sync error'
      );
    });

    it('should ignore non-invoice or unknown actions gracefully', async () => {
      const nonInvoiceItem = {
        ...sampleCreateQueueItem,
        entityType: 'PROPERTY' as any,
      };

      const unknownActionInvoiceItem: SyncQueueItem = {
        ...sampleCreateQueueItem,
        action: SyncAction.Update,
      };

      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([
        nonInvoiceItem,
        unknownActionInvoiceItem,
      ]);

      const result = await SyncService.syncPendingQueue();

      expect(result).toEqual({ synced: 0, failed: 0 });
      expect(InvoiceService.createInvoice).not.toHaveBeenCalled();
    });
  });

  describe('pullRemoteInvoices', () => {
    it('should return empty array when offline', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({ isConnected: false });

      const result = await SyncService.pullRemoteInvoices();

      expect(result).toEqual([]);
      expect(InvoiceService.getInvoices).not.toHaveBeenCalled();
    });

    it('should fetch and persist remote invoices when online', async () => {
      const remoteInvoices: InvoiceResponse[] = [
        {
          _id: 'rem-1',
          title: 'Bloco',
          value: 100,
          purchaseDate: '2026-10-15',
          property: null,
          category: 'Alvenaria',
          subcategory: '',
          observation: '',
          filePath: '',
        },
      ];

      (InvoiceService.getInvoices as jest.Mock).mockResolvedValue(remoteInvoices);

      const result = await SyncService.pullRemoteInvoices('prop-1');

      expect(InvoiceService.getInvoices).toHaveBeenCalledWith('prop-1');
      expect(InvoiceLocalRepository.saveInvoicesFromRemote).toHaveBeenCalledWith(remoteInvoices);
      expect(result).toEqual(remoteInvoices);
    });

    it('should return empty array when InvoiceService throws', async () => {
      (InvoiceService.getInvoices as jest.Mock).mockRejectedValue(new Error('Server error'));

      const result = await SyncService.pullRemoteInvoices();

      expect(result).toEqual([]);
    });
  });

  describe('syncAll', () => {
    it('should sync queue, pull remote, and return local invoices', async () => {
      (InvoiceLocalRepository.getPendingSyncQueue as jest.Mock).mockResolvedValue([]);
      (InvoiceService.getInvoices as jest.Mock).mockResolvedValue([]);
      (InvoiceLocalRepository.getInvoices as jest.Mock).mockResolvedValue([sampleEntity]);

      const result = await SyncService.syncAll('prop-1');

      expect(InvoiceLocalRepository.getInvoices).toHaveBeenCalledWith('prop-1');
      expect(result).toEqual([sampleEntity]);
    });
  });

  describe('saveInvoiceOfflineFirst', () => {
    it('should save locally with pending status and trigger background sync', async () => {
      const payload: CreateInvoiceRequest = {
        title: 'Cimento',
        value: 50,
        purchaseDate: '2026-10-15',
        property: 'prop-1',
        category: 'Alvenaria',
        subcategory: 'Massa',
        observation: 'Nota 1',
        filePath: 'file:///path.png',
      };

      const result = await SyncService.saveInvoiceOfflineFirst(payload, 'Casa Centro');

      expect(InvoiceLocalRepository.saveInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Cimento',
          value: 50,
          propertyName: 'Casa Centro',
          syncStatus: SyncStatus.PendingCreate,
        }),
        SyncAction.Create
      );
      expect(result.title).toBe('Cimento');
    });

    it('should handle optional null fields when saving offline first', async () => {
      const payload: CreateInvoiceRequest = {
        title: 'Cimento',
        value: 50,
        purchaseDate: '2026-10-15',
        property: 'prop-1',
        category: 'Alvenaria',
        subcategory: 'Massa',
      };

      const result = await SyncService.saveInvoiceOfflineFirst(payload);

      expect(InvoiceLocalRepository.saveInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyName: null,
          observation: null,
          filePath: null,
        }),
        SyncAction.Create
      );
      expect(result.propertyName).toBeNull();
    });

    it('should save invoice locally without triggering sync when offline', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({ isConnected: false });
      const payload: CreateInvoiceRequest = {
        title: 'Tijolo',
        value: 100,
        purchaseDate: '2026-10-15',
        property: 'prop-1',
        category: 'Alvenaria',
        subcategory: 'Blocos',
      };

      const result = await SyncService.saveInvoiceOfflineFirst(payload);

      expect(InvoiceLocalRepository.saveInvoice).toHaveBeenCalledTimes(1);
      expect(result.title).toBe('Tijolo');
      expect(InvoiceLocalRepository.getPendingSyncQueue).not.toHaveBeenCalled();
    });
  });

  describe('deleteInvoiceOfflineFirst', () => {
    it('should call deleteInvoiceLocally and trigger sync when online', async () => {
      await SyncService.deleteInvoiceOfflineFirst('inv-123');

      expect(InvoiceLocalRepository.deleteInvoiceLocally).toHaveBeenCalledWith('inv-123');
    });

    it('should call deleteInvoiceLocally without triggering sync when offline', async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({ isConnected: false });

      await SyncService.deleteInvoiceOfflineFirst('inv-offline');

      expect(InvoiceLocalRepository.deleteInvoiceLocally).toHaveBeenCalledWith('inv-offline');
      expect(InvoiceLocalRepository.getPendingSyncQueue).not.toHaveBeenCalled();
    });
  });

  describe('syncing state helpers and UUID fallback', () => {
    it('should get and set syncing status', () => {
      SyncService.setSyncingStatus(true);
      expect(SyncService.getSyncingStatus()).toBe(true);

      SyncService.setSyncingStatus(false);
      expect(SyncService.getSyncingStatus()).toBe(false);
    });

    it('should fallback to manual UUID generation if crypto is undefined', async () => {
      const originalCrypto = globalThis.crypto;

      try {
        delete (globalThis as any).crypto;
        const payload: CreateInvoiceRequest = {
          title: 'Tinta',
          value: 80,
          purchaseDate: '2026-10-15',
          property: 'prop-1',
          category: 'Pintura',
          subcategory: 'Geral',
        };

        const result = await SyncService.saveInvoiceOfflineFirst(payload);
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe('string');
      } finally {
        (globalThis as any).crypto = originalCrypto;
      }
    });
  });
});
