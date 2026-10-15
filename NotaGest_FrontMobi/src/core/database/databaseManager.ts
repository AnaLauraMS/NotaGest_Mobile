import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseConfig } from '../constants/enums';
import { INITIAL_MIGRATION } from './migrations';

export class DatabaseManager {
  private static instance: SQLiteDatabase | null = null;
  private static initPromise: Promise<SQLiteDatabase> | null = null;

  public static async getDatabase(dbName: string = DatabaseConfig.Name): Promise<SQLiteDatabase> {
    if (this.instance) {
      return this.instance;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(dbName);
      await db.execAsync(INITIAL_MIGRATION);
      this.instance = db;
      this.initPromise = null;
      return db;
    })().catch((error) => {
      this.initPromise = null;
      throw error;
    });

    return this.initPromise;
  }

  public static async closeDatabase(): Promise<void> {
    if (this.instance) {
      await this.instance.closeAsync();
      this.instance = null;
    }
    this.initPromise = null;
  }

  public static setInstance(database: SQLiteDatabase | null): void {
    this.instance = database;
    this.initPromise = null;
  }
}
