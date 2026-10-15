export const INITIAL_MIGRATION = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  value REAL NOT NULL,
  purchase_date TEXT NOT NULL,
  property_id TEXT,
  property_name TEXT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  observation TEXT,
  file_path TEXT,
  sync_status TEXT NOT NULL CHECK(sync_status IN ('SYNCED', 'PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_sync_status ON invoices(sync_status);
CREATE INDEX IF NOT EXISTS idx_invoices_property_id ON invoices(property_id);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('INVOICE', 'PROPERTY')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE')),
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at ASC);
`;
