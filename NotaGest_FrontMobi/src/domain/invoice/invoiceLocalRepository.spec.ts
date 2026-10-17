import { InvoiceLocalRepository } from './invoiceLocalRepository';
import { DatabaseManager } from '../../core/database/databaseManager';
import { SyncAction, SyncEntityType, SyncStatus } from '../../core/constants/enums';
import { InvoiceLocalEntity, InvoiceRow, SyncQueueRow } from './types';
import { InvoiceResponse } from './schemas';

describe('InvoiceLocalRepository', () => {
  const mockRunAsync = jest.fn();
  const mockGetAllAsync = jest.fn();
  const mockGetFirstAsync = jest.fn();
  const mockWithTransactionAsync = jest.fn();

  const mockDb = {
    runAsync: mockRunAsync,
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
    withTransactionAsync: mockWithTransactionAsync,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithTransactionAsync.mockImplementation(async (callback: () => Promise<void>) => {
      await callback();
    });
    mockRunAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
    jest.spyOn(DatabaseManager, 'getDatabase').mockResolvedValue(mockDb as any);
  });

  const sampleEntity: InvoiceLocalEntity = {
    id: 'inv-123',
    title: 'Cimento CP II',
    value: 350.5,
    purchaseDate: '2026-10-15',
    propertyId: 'prop-1',
    propertyName: 'Casa Centro',
    category: 'Material de Construção',
    subcategory: 'Alvenaria',
    observation: 'Nota entregue na obra',
    filePath: 'file:///path/to/invoice.jpg',
    syncStatus: SyncStatus.PendingCreate,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  };

  const sampleRow: InvoiceRow = {
    id: 'inv-123',
    title: 'Cimento CP II',
    value: 350.5,
    purchase_date: '2026-10-15',
    property_id: 'prop-1',
    property_name: 'Casa Centro',
    category: 'Material de Construção',
    subcategory: 'Alvenaria',
    observation: 'Nota entregue na obra',
    file_path: 'file:///path/to/invoice.jpg',
    sync_status: SyncStatus.PendingCreate,
    created_at: '2026-10-15T10:00:00.000Z',
    updated_at: '2026-10-15T10:00:00.000Z',
  };

  const sampleQueueRow: SyncQueueRow = {
    id: 'queue-1',
    entity_type: SyncEntityType.Invoice,
    entity_id: 'inv-123',
    action: SyncAction.Create,
    payload: JSON.stringify(sampleEntity),
    attempts: 0,
    last_error: null,
    created_at: '2026-10-15T10:00:00.000Z',
  };

  describe('saveInvoice', () => {
    it('should save invoice without sync action when action is omitted', async () => {
      await InvoiceLocalRepository.saveInvoice(sampleEntity);

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        sampleEntity.id,
        sampleEntity.title,
        sampleEntity.value,
        sampleEntity.purchaseDate,
        sampleEntity.propertyId,
        sampleEntity.propertyName,
        sampleEntity.category,
        sampleEntity.subcategory,
        sampleEntity.observation,
        sampleEntity.filePath,
        sampleEntity.syncStatus,
        sampleEntity.createdAt,
        sampleEntity.updatedAt
      );
    });

    it('should save invoice and enqueue sync action when action is provided', async () => {
      await InvoiceLocalRepository.saveInvoice(sampleEntity, SyncAction.Create);

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenCalledTimes(2);
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO sync_queue'),
        expect.any(String),
        SyncEntityType.Invoice,
        sampleEntity.id,
        SyncAction.Create,
        JSON.stringify(sampleEntity),
        expect.any(String)
      );
    });

    it('should handle entity with null optional fields correctly', async () => {
      const minimalEntity: InvoiceLocalEntity = {
        id: 'inv-null',
        title: 'Tinta',
        value: 120,
        purchaseDate: '2026-10-15',
        category: 'Pintura',
        subcategory: 'Látex',
        syncStatus: SyncStatus.Synced,
        createdAt: '2026-10-15T10:00:00.000Z',
        updatedAt: '2026-10-15T10:00:00.000Z',
      };

      await InvoiceLocalRepository.saveInvoice(minimalEntity);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        minimalEntity.id,
        minimalEntity.title,
        minimalEntity.value,
        minimalEntity.purchaseDate,
        null,
        null,
        minimalEntity.category,
        minimalEntity.subcategory,
        null,
        null,
        minimalEntity.syncStatus,
        minimalEntity.createdAt,
        minimalEntity.updatedAt
      );
    });
  });

  describe('saveInvoicesFromRemote', () => {
    it('should save remote invoices when no pending local mutations exist', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      const remoteInvoices: InvoiceResponse[] = [
        {
          _id: 'rem-1',
          title: 'Madeira',
          value: 450,
          purchaseDate: '2026-10-14',
          property: { _id: 'prop-1', nome: 'Obra 1' },
          category: 'Estrutura',
          subcategory: 'Madeiramento',
          observation: 'Vigas',
          filePath: 'https://cdn.example.com/vigas.jpg',
          createdAt: '2026-10-14T08:00:00.000Z',
        },
      ];

      await InvoiceLocalRepository.saveInvoicesFromRemote(remoteInvoices);

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT sync_status FROM invoices WHERE id = ?',
        'rem-1'
      );
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        'rem-1',
        'Madeira',
        450,
        '2026-10-14',
        'prop-1',
        'Obra 1',
        'Estrutura',
        'Madeiramento',
        'Vigas',
        'https://cdn.example.com/vigas.jpg',
        SyncStatus.Synced,
        '2026-10-14T08:00:00.000Z',
        expect.any(String)
      );
    });

    it('should parse string property, fallback createdAt, and handle null observation/filePath', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      const remoteInvoices: InvoiceResponse[] = [
        {
          _id: 'rem-2',
          title: 'Areia',
          value: 200,
          purchaseDate: '2026-10-14',
          property: 'prop-string-id',
          category: 'Agregados',
          subcategory: 'Areia Média',
        },
        {
          _id: 'rem-3',
          title: 'Brita',
          value: 150,
          purchaseDate: '2026-10-14',
          property: null,
          category: 'Agregados',
          subcategory: 'Brita 1',
        },
      ];

      await InvoiceLocalRepository.saveInvoicesFromRemote(remoteInvoices);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        'rem-2',
        'Areia',
        200,
        '2026-10-14',
        'prop-string-id',
        null,
        'Agregados',
        'Areia Média',
        null,
        null,
        SyncStatus.Synced,
        expect.any(String),
        expect.any(String)
      );

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO invoices'),
        'rem-3',
        'Brita',
        150,
        '2026-10-14',
        null,
        null,
        'Agregados',
        'Brita 1',
        null,
        null,
        SyncStatus.Synced,
        expect.any(String),
        expect.any(String)
      );
    });

    it('should skip remote invoice when local record has pending sync status', async () => {
      mockGetFirstAsync.mockResolvedValueOnce({ sync_status: SyncStatus.PendingCreate });
      mockGetFirstAsync.mockResolvedValueOnce({ sync_status: SyncStatus.PendingUpdate });
      mockGetFirstAsync.mockResolvedValueOnce({ sync_status: SyncStatus.PendingDelete });

      const remoteInvoices: InvoiceResponse[] = [
        { _id: 'skip-1', title: 'A', value: 10, purchaseDate: '2026-10-14', property: null, category: 'Geral', subcategory: '', observation: '', filePath: '' },
        { _id: 'skip-2', title: 'B', value: 20, purchaseDate: '2026-10-14', property: null, category: 'Geral', subcategory: '', observation: '', filePath: '' },
        { _id: 'skip-3', title: 'C', value: 30, purchaseDate: '2026-10-14', property: null, category: 'Geral', subcategory: '', observation: '', filePath: '' },
      ];

      await InvoiceLocalRepository.saveInvoicesFromRemote(remoteInvoices);

      expect(mockRunAsync).not.toHaveBeenCalled();
    });
  });

  describe('getInvoices', () => {
    it('should return all invoices excluding pending delete when propertyId is not provided', async () => {
      mockGetAllAsync.mockResolvedValue([sampleRow]);

      const result = await InvoiceLocalRepository.getInvoices();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sync_status != ?'),
        SyncStatus.PendingDelete
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleEntity);
    });

    it('should filter by propertyId when propertyId is provided', async () => {
      mockGetAllAsync.mockResolvedValue([sampleRow]);

      const result = await InvoiceLocalRepository.getInvoices('prop-1');

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('AND property_id = ?'),
        SyncStatus.PendingDelete,
        'prop-1'
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleEntity);
    });

    it('should treat empty or whitespace propertyId as omitted', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      await InvoiceLocalRepository.getInvoices('   ');

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sync_status != ?'),
        SyncStatus.PendingDelete
      );
    });
  });

  describe('getInvoiceById', () => {
    it('should return mapped entity when invoice exists', async () => {
      mockGetFirstAsync.mockResolvedValue(sampleRow);

      const result = await InvoiceLocalRepository.getInvoiceById('inv-123');

      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM invoices WHERE id = ?',
        'inv-123'
      );
      expect(result).toEqual(sampleEntity);
    });

    it('should return null when invoice does not exist', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      const result = await InvoiceLocalRepository.getInvoiceById('inv-not-found');

      expect(result).toBeNull();
    });
  });

  describe('deleteInvoiceLocally', () => {
    it('should return without changes if invoice does not exist', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      await InvoiceLocalRepository.deleteInvoiceLocally('non-existent');

      expect(mockWithTransactionAsync).not.toHaveBeenCalled();
      expect(mockRunAsync).not.toHaveBeenCalled();
    });

    it('should permanently purge invoices and queue when status is PENDING_CREATE', async () => {
      mockGetFirstAsync.mockResolvedValue({ sync_status: SyncStatus.PendingCreate });

      await InvoiceLocalRepository.deleteInvoiceLocally('inv-pending-create');

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        1,
        'DELETE FROM invoices WHERE id = ?',
        'inv-pending-create'
      );
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
        'inv-pending-create',
        SyncEntityType.Invoice
      );
    });

    it('should mark as PENDING_DELETE and enqueue delete action when status is SYNCED', async () => {
      mockGetFirstAsync.mockResolvedValue({ sync_status: SyncStatus.Synced });

      await InvoiceLocalRepository.deleteInvoiceLocally('inv-synced');

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE invoices SET sync_status = ?, updated_at = ? WHERE id = ?'),
        SyncStatus.PendingDelete,
        expect.any(String),
        'inv-synced'
      );
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO sync_queue'),
        expect.any(String),
        SyncEntityType.Invoice,
        'inv-synced',
        SyncAction.Delete,
        JSON.stringify({ id: 'inv-synced' }),
        expect.any(String)
      );
    });
  });

  describe('markAsSynced', () => {
    it('should update status and remove from queue without ID change when remoteId matches or omitted', async () => {
      await InvoiceLocalRepository.markAsSynced('inv-123');

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE invoices SET sync_status = ?, updated_at = ? WHERE id = ?'),
        SyncStatus.Synced,
        expect.any(String),
        'inv-123'
      );
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
        'inv-123',
        SyncEntityType.Invoice
      );
    });

    it('should update primary key ID to remoteId when remoteId differs from localId', async () => {
      await InvoiceLocalRepository.markAsSynced('local-temp-id', 'server-perm-id');

      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE invoices SET id = ?, sync_status = ?, updated_at = ? WHERE id = ?'),
        'server-perm-id',
        SyncStatus.Synced,
        expect.any(String),
        'local-temp-id'
      );
      expect(mockRunAsync).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM sync_queue WHERE entity_id = ? AND entity_type = ?',
        'local-temp-id',
        SyncEntityType.Invoice
      );
    });
  });

  describe('syncQueue operations', () => {
    it('should retrieve pending sync queue items sorted chronologically', async () => {
      mockGetAllAsync.mockResolvedValue([sampleQueueRow]);

      const queue = await InvoiceLocalRepository.getPendingSyncQueue();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM sync_queue ORDER BY created_at ASC'
      );
      expect(queue).toHaveLength(1);
      expect(queue[0]).toEqual({
        id: 'queue-1',
        entityType: SyncEntityType.Invoice,
        entityId: 'inv-123',
        action: SyncAction.Create,
        payload: JSON.stringify(sampleEntity),
        attempts: 0,
        lastError: null,
        createdAt: '2026-10-15T10:00:00.000Z',
      });
    });

    it('should remove item from sync queue by queueId', async () => {
      await InvoiceLocalRepository.removeSyncQueueItem('queue-1');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM sync_queue WHERE id = ?',
        'queue-1'
      );
    });

    it('should update sync queue item attempts and last error', async () => {
      await InvoiceLocalRepository.updateSyncQueueAttempt('queue-1', 'Network timeout');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
        'Network timeout',
        'queue-1'
      );
    });
  });

  describe('UUID generation fallback', () => {
    it('should use crypto.randomUUID when available and fallback to manual generation when unavailable', async () => {
      const originalCrypto = globalThis.crypto;

      try {
        delete (globalThis as any).crypto;
        await InvoiceLocalRepository.saveInvoice(sampleEntity, SyncAction.Create);
        expect(mockRunAsync).toHaveBeenCalledTimes(2);
      } finally {
        (globalThis as any).crypto = originalCrypto;
      }
    });
  });
});
