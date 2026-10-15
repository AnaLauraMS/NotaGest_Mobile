import { getAuthServiceUrl, loginUser, registerUser, decodeJwt } from './authService';

describe('authService', () => {
  const originalEnv = process.env;
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    (globalThis as any).fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getAuthServiceUrl', () => {
    it('should return configured NEXT_PUBLIC_AUTH_SERVICE_URL when containing /api/users', () => {
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = 'https://custom-api.com/api/users';

      const url = getAuthServiceUrl();

      expect(url).toBe('https://custom-api.com/api/users');
    });

    it('should append /api/users if missing from NEXT_PUBLIC_AUTH_SERVICE_URL', () => {
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = 'https://custom-api.com';

      const url = getAuthServiceUrl();

      expect(url).toBe('https://custom-api.com/api/users');
    });

    it('should strip trailing slashes before appending /api/users', () => {
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = 'https://custom-api.com///';

      const url = getAuthServiceUrl();

      expect(url).toBe('https://custom-api.com/api/users');
    });

    it('should derive auth URL from NEXT_PUBLIC_BACKEND_URL when auth url is missing', () => {
      delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = 'https://backend-service.onrender.com';

      const url = getAuthServiceUrl();

      expect(url).toBe('https://backend-service.onrender.com/api/users');
    });

    it('should fallback to production Render backend when no environment variables exist', () => {
      delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
      delete process.env.NEXT_PUBLIC_BACKEND_URL;

      const url = getAuthServiceUrl();

      expect(url).toBe('https://notagest-0o2r.onrender.com/api/users');
    });
  });

  describe('loginUser', () => {
    it('should perform POST request and return login response on success', async () => {
      const mockSuccessResponse = {
        token: 'fake-jwt-token',
        message: 'Login realizado com sucesso',
        error: '',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await loginUser('user@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://notagest-0o2r.onrender.com/api/users/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com', senha: 'password123' }),
        }
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should throw error when login response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Credenciais inválidas' }),
      });

      await expect(loginUser('user@example.com', 'wrongpassword')).rejects.toThrow(
        'Credenciais inválidas'
      );
    });

    it('should throw fallback error when error message is missing in failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(loginUser('user@example.com', 'wrongpassword')).rejects.toThrow(
        'Erro desconhecido no login.'
      );
    });
  });

  describe('registerUser', () => {
    it('should perform POST request and return data on successful registration', async () => {
      const mockData = { message: 'Usuário registrado com sucesso' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await registerUser('João da Silva', 'joao@example.com', 'secret123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://notagest-0o2r.onrender.com/api/users/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'João da Silva',
            email: 'joao@example.com',
            senha: 'secret123',
          }),
        }
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when registration fails with server message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'E-mail já cadastrado.' }),
      });

      await expect(
        registerUser('João da Silva', 'joao@example.com', 'secret123')
      ).rejects.toThrow('E-mail já cadastrado.');
    });

    it('should throw generic error when failed registration returns empty body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        registerUser('João da Silva', 'joao@example.com', 'secret123')
      ).rejects.toThrow('Erro ao registrar usuário.');
    });
  });

  describe('decodeJwt', () => {
    it('should decode a valid JWT token payload', () => {
      const payload = { id: 'usr-12345', email: 'test@notagest.com' };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const fakeJwt = `header.${encodedPayload}.signature`;

      const result = decodeJwt(fakeJwt);

      expect(result.id).toBe('usr-12345');
      expect(result.email).toBe('test@notagest.com');
    });

    it('should return empty fields when given an invalid token string', () => {
      const result = decodeJwt('invalid-malformed-token');

      expect(result).toEqual({ id: '', email: '' });
    });
  });
});
