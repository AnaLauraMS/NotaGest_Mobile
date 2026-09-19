import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SecureStorageService } from './secureStorage';
import { StorageKey } from '../constants/enums';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('SecureStorageService', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  describe('Native Platform', () => {
    it('should save token into secure store', async () => {
      const fakeToken = 'mocked-jwt-token';

      await SecureStorageService.saveToken(fakeToken);

      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(StorageKey.AuthToken, fakeToken);
    });

    it('should retrieve token from secure store', async () => {
      const fakeToken = 'stored-jwt-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(fakeToken);

      const result = await SecureStorageService.getToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(StorageKey.AuthToken);
      expect(result).toBe(fakeToken);
    });

    it('should remove token from secure store', async () => {
      await SecureStorageService.removeToken();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(StorageKey.AuthToken);
    });

    it('should clear all stored items', async () => {
      await SecureStorageService.clearAll();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(StorageKey.AuthToken);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(StorageKey.UserData);
    });
  });

  describe('Web Platform', () => {
    const mockLocalStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    beforeEach(() => {
      Platform.OS = 'web';
      Object.defineProperty(globalThis, 'window', {
        value: { localStorage: mockLocalStorage },
        writable: true,
      });
    });

    it('should save token into localStorage on web', async () => {
      const fakeToken = 'web-token';

      await SecureStorageService.saveToken(fakeToken);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(StorageKey.AuthToken, fakeToken);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should get token from localStorage on web', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce('web-token');

      const result = await SecureStorageService.getToken();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(StorageKey.AuthToken);
      expect(result).toBe('web-token');
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should remove token from localStorage on web', async () => {
      await SecureStorageService.removeToken();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(StorageKey.AuthToken);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('should clear all tokens from localStorage on web', async () => {
      await SecureStorageService.clearAll();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(StorageKey.AuthToken);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(StorageKey.UserData);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});
