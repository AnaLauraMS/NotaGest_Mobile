import * as SQLite from 'expo-sqlite';
import { DatabaseManager } from './databaseManager';
import { DatabaseConfig } from '../constants/enums';
import { INITIAL_MIGRATION } from './migrations';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('DatabaseManager', () => {
  const mockExecAsync = jest.fn();
  const mockCloseAsync = jest.fn();
  const mockDatabaseInstance = {
    execAsync: mockExecAsync,
    closeAsync: mockCloseAsync,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    DatabaseManager.setInstance(null);
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabaseInstance);
    mockExecAsync.mockResolvedValue(undefined);
    mockCloseAsync.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await DatabaseManager.closeDatabase();
  });

  it('should initialize database with default name and execute initial migration', async () => {
    const db = await DatabaseManager.getDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(DatabaseConfig.Name);
    expect(mockExecAsync).toHaveBeenCalledTimes(1);
    expect(mockExecAsync).toHaveBeenCalledWith(INITIAL_MIGRATION);
    expect(db).toBe(mockDatabaseInstance);
  });

  it('should initialize database with custom name when provided', async () => {
    const customDbName = 'test_custom.db';

    const db = await DatabaseManager.getDatabase(customDbName);

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(customDbName);
    expect(db).toBe(mockDatabaseInstance);
  });

  it('should reuse existing instance when called multiple times', async () => {
    const firstCallDb = await DatabaseManager.getDatabase();
    const secondCallDb = await DatabaseManager.getDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(mockExecAsync).toHaveBeenCalledTimes(1);
    expect(firstCallDb).toBe(mockDatabaseInstance);
    expect(secondCallDb).toBe(mockDatabaseInstance);
  });

  it('should handle concurrent getDatabase calls sharing single initialization promise', async () => {
    const [firstDb, secondDb] = await Promise.all([
      DatabaseManager.getDatabase(),
      DatabaseManager.getDatabase(),
    ]);

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(mockExecAsync).toHaveBeenCalledTimes(1);
    expect(firstDb).toBe(mockDatabaseInstance);
    expect(secondDb).toBe(mockDatabaseInstance);
  });

  it('should reset initPromise and propagate error when openDatabaseAsync fails', async () => {
    const databaseError = new Error('Disk I/O error');
    (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValueOnce(databaseError);

    await expect(DatabaseManager.getDatabase()).rejects.toThrow('Disk I/O error');

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValueOnce(mockDatabaseInstance);
    const retryDb = await DatabaseManager.getDatabase();

    expect(retryDb).toBe(mockDatabaseInstance);
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(2);
  });

  it('should close database when instance exists', async () => {
    await DatabaseManager.getDatabase();

    await DatabaseManager.closeDatabase();

    expect(mockCloseAsync).toHaveBeenCalledTimes(1);

    await DatabaseManager.getDatabase();
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(2);
  });

  it('should safely do nothing when closeDatabase is called on empty instance', async () => {
    await DatabaseManager.closeDatabase();

    expect(mockCloseAsync).not.toHaveBeenCalled();
  });

  it('should allow setting database instance directly', async () => {
    const fakeCustomDb = { ...mockDatabaseInstance };

    DatabaseManager.setInstance(fakeCustomDb as any);
    const result = await DatabaseManager.getDatabase();

    expect(result).toBe(fakeCustomDb);
    expect(SQLite.openDatabaseAsync).not.toHaveBeenCalled();
  });
});
