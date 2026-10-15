export enum StorageKey {
  AuthToken = 'notagest_auth_token',
  UserData = 'notagest_user_data',
}

export enum HttpHeader {
  Authorization = 'Authorization',
  ContentType = 'Content-Type',
}

export enum ContentType {
  Json = 'application/json',
  MultipartFormData = 'multipart/form-data',
}

export enum ApiEndpoint {
  Login = '/api/users/login',
  Register = '/api/users/register',
  UserProfile = '/api/users/me',
  Properties = '/api/imoveis',
  PropertiesNames = '/api/imoveis/nome',
  Invoices = '/api/uploads',
  UploadPhysicalFile = '/api/uploadfile',
  AiExtract = '/api/ai/extract',
  AiQuery = '/api/ai/query',
}

export enum PropertyType {
  Residencial = 'Residencial',
  Comercial = 'Comercial',
  Industrial = 'Industrial',
  Rural = 'Rural',
}

export enum InvoiceCategory {
  MaterialConstrucao = 'Material de Construção',
  MaoDeObra = 'Mão de Obra',
  Documentacao = 'Documentação',
  Impostos = 'Impostos',
  Outros = 'Outros',
}

export enum SyncStatus {
  Synced = 'SYNCED',
  PendingCreate = 'PENDING_CREATE',
  PendingUpdate = 'PENDING_UPDATE',
  PendingDelete = 'PENDING_DELETE',
}

export enum SyncAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

export enum SyncEntityType {
  Invoice = 'INVOICE',
  Property = 'PROPERTY',
}

export enum DatabaseConfig {
  Name = 'notagest.db',
}

