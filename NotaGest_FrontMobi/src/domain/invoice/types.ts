import { SyncAction, SyncEntityType, SyncStatus } from '../../core/constants/enums';

export interface InvoiceLocalEntity {
  id: string;
  title: string;
  value: number;
  purchaseDate: string;
  propertyId?: string | null;
  propertyName?: string | null;
  category: string;
  subcategory: string;
  observation?: string | null;
  filePath?: string | null;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload: string;
  attempts: number;
  lastError?: string | null;
  createdAt: string;
}

export interface InvoiceRow {
  id: string;
  title: string;
  value: number;
  purchase_date: string;
  property_id: string | null;
  property_name: string | null;
  category: string;
  subcategory: string;
  observation: string | null;
  file_path: string | null;
  sync_status: string;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  payload: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
}
