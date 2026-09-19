import { httpClient } from '../../core/http/client';
import { ApiEndpoint } from '../../core/constants/enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  PropertySimpleName,
  createPropertyRequestSchema,
  propertyListResponseSchema,
  propertyResponseSchema,
  propertySimpleNameListSchema,
} from './schemas';

export class PropertyService {
  public static async getProperties(): Promise<PropertyResponse[]> {
    const response = await httpClient.get(ApiEndpoint.Properties);
    return propertyListResponseSchema.parse(response.data);
  }

  public static async getPropertiesNames(): Promise<PropertySimpleName[]> {
    const response = await httpClient.get(ApiEndpoint.PropertiesNames);
    return propertySimpleNameListSchema.parse(response.data);
  }

  public static async createProperty(payload: CreatePropertyRequest): Promise<PropertyResponse> {
    const validatedPayload = createPropertyRequestSchema.parse(payload);
    const response = await httpClient.post(ApiEndpoint.Properties, validatedPayload);
    return propertyResponseSchema.parse(response.data);
  }

  public static async deleteProperty(propertyId: string): Promise<void> {
    if (!propertyId || propertyId.trim() === '') {
      throw new Error('Property ID must be provided');
    }
    await httpClient.delete(`${ApiEndpoint.Properties}/${propertyId}`);
  }
}
