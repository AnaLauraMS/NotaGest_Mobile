import api, { getBackendUrl } from './api';

describe('api utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getBackendUrl', () => {
    it('should return NEXT_PUBLIC_BACKEND_URL when defined', () => {
      process.env.NEXT_PUBLIC_BACKEND_URL = 'https://my-backend.onrender.com';

      const url = getBackendUrl();

      expect(url).toBe('https://my-backend.onrender.com');
    });

    it('should strip trailing slash from NEXT_PUBLIC_BACKEND_URL', () => {
      process.env.NEXT_PUBLIC_BACKEND_URL = 'https://my-backend.onrender.com///';

      const url = getBackendUrl();

      expect(url).toBe('https://my-backend.onrender.com');
    });

    it('should fallback to production Render backend when NEXT_PUBLIC_BACKEND_URL is undefined', () => {
      delete process.env.NEXT_PUBLIC_BACKEND_URL;

      const url = getBackendUrl();

      expect(url).toBe('https://notagest-0o2r.onrender.com');
    });
  });

  describe('api interceptor', () => {
    const originalLocalStorage = global.localStorage;

    beforeEach(() => {
      const mockStorage: Record<string, string> = {};
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn((key: string) => mockStorage[key] || null),
          setItem: jest.fn((key: string, value: string) => {
            mockStorage[key] = value;
          }),
          removeItem: jest.fn((key: string) => {
            delete mockStorage[key];
          }),
        },
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should attach Authorization header when token is present in localStorage', async () => {
      localStorage.setItem('token', 'valid-jwt-token');

      const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const config = { headers: {} as Record<string, string> };

      const result = await interceptor(config);

      expect(result.headers.Authorization).toBe('Bearer valid-jwt-token');
    });

    it('should not attach Authorization header when token is absent in localStorage', async () => {
      const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const config = { headers: {} as Record<string, string> };

      const result = await interceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should reject when interceptor error handler is invoked', async () => {
      const rejectHandler = (api.interceptors.request as any).handlers[0].rejected;
      const mockError = new Error('Network failure');

      await expect(rejectHandler(mockError)).rejects.toThrow('Network failure');
    });
  });
});
