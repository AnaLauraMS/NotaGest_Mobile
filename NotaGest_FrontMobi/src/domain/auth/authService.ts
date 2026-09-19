import { httpClient } from '../../core/http/client';
import { ApiEndpoint } from '../../core/constants/enums';
import { SecureStorageService } from '../../core/storage/secureStorage';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema,
  userProfileSchema,
} from './schemas';

export class AuthService {
  public static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validatedRequest = loginRequestSchema.parse(credentials);
    const response = await httpClient.post(ApiEndpoint.Login, validatedRequest);
    const validatedResponse = loginResponseSchema.parse(response.data);

    await SecureStorageService.saveToken(validatedResponse.token);
    return validatedResponse;
  }

  public static async register(payload: RegisterRequest): Promise<void> {
    const validatedPayload = registerRequestSchema.parse(payload);
    await httpClient.post(ApiEndpoint.Register, validatedPayload);
  }

  public static async getProfile(): Promise<UserProfile> {
    const response = await httpClient.get(ApiEndpoint.UserProfile);
    return userProfileSchema.parse(response.data);
  }

  public static async logout(): Promise<void> {
    await SecureStorageService.clearAll();
  }
}
