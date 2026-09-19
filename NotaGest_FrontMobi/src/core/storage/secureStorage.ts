import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StorageKey } from '../constants/enums';

export class SecureStorageService {
  public static async saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(StorageKey.AuthToken, token);
      }
      return;
    }
    await SecureStore.setItemAsync(StorageKey.AuthToken, token);
  }

  public static async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(StorageKey.AuthToken);
      }
      return null;
    }
    return SecureStore.getItemAsync(StorageKey.AuthToken);
  }

  public static async removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(StorageKey.AuthToken);
      }
      return;
    }
    await SecureStore.deleteItemAsync(StorageKey.AuthToken);
  }

  public static async clearAll(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(StorageKey.AuthToken);
        window.localStorage.removeItem(StorageKey.UserData);
      }
      return;
    }
    await SecureStore.deleteItemAsync(StorageKey.AuthToken);
    await SecureStore.deleteItemAsync(StorageKey.UserData);
  }
}
