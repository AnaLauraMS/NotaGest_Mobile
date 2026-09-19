import { AuthService } from './authService';
import { httpClient } from '../../core/http/client';
import { SecureStorageService } from '../../core/storage/secureStorage';
import { ApiEndpoint } from '../../core/constants/enums';

jest.mock('../../core/http/client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../core/storage/secureStorage', () => ({
  SecureStorageService: {
    saveToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate user and store token when payload and response are valid', async () => {
    const validCredentials = {
      email: 'nicolas@exemplo.com',
      senha: 'password123',
    };
    const backendResponse = {
      token: 'jwt-valid-token',
      user: {
        id: 'user-id-1',
        nome: 'Nicolas',
        email: 'nicolas@exemplo.com',
      },
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: backendResponse });

    const result = await AuthService.login(validCredentials);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith(ApiEndpoint.Login, validCredentials);
    expect(SecureStorageService.saveToken).toHaveBeenCalledTimes(1);
    expect(SecureStorageService.saveToken).toHaveBeenCalledWith('jwt-valid-token');
    expect(result).toEqual(backendResponse);
  });

  it('should reject login execution and not call http client when request payload is invalid', async () => {
    const invalidCredentials = {
      email: 'invalid-email-format',
      senha: '123',
    };

    await expect(AuthService.login(invalidCredentials)).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
    expect(SecureStorageService.saveToken).not.toHaveBeenCalled();
  });

  it('should throw validation error and not save token if backend returns payload missing token', async () => {
    const validCredentials = {
      email: 'nicolas@exemplo.com',
      senha: 'password123',
    };
    const corruptedBackendResponse = {
      user: {
        id: 'user-id-1',
        nome: 'Nicolas',
        email: 'nicolas@exemplo.com',
      },
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: corruptedBackendResponse });

    await expect(AuthService.login(validCredentials)).rejects.toThrow();
    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(SecureStorageService.saveToken).not.toHaveBeenCalled();
  });

  it('should register user successfully when payload is valid', async () => {
    const validPayload = {
      nome: 'Nicolas',
      email: 'nicolas@exemplo.com',
      senha: 'securepassword123',
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Cadastrado' } });

    await AuthService.register(validPayload);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith(ApiEndpoint.Register, validPayload);
  });

  it('should reject register execution when payload fails schema validation', async () => {
    const invalidPayload = {
      nome: 'N',
      email: 'not-an-email',
      senha: '12',
    };

    await expect(AuthService.register(invalidPayload)).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('should fetch user profile and validate response schema', async () => {
    const validProfileResponse = {
      _id: 'user-6789',
      nome: 'Nicolas Silva',
      email: 'nicolas.silva@exemplo.com',
    };

    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: validProfileResponse });

    const profile = await AuthService.getProfile();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith(ApiEndpoint.UserProfile);
    expect(profile).toEqual(validProfileResponse);
  });

  it('should fail if profile response does not match schema', async () => {
    const corruptedProfile = {
      _id: 12345,
    };

    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: corruptedProfile });

    await expect(AuthService.getProfile()).rejects.toThrow();
  });

  it('should clear all tokens and user data on logout', async () => {
    await AuthService.logout();

    expect(SecureStorageService.clearAll).toHaveBeenCalledTimes(1);
  });
});
