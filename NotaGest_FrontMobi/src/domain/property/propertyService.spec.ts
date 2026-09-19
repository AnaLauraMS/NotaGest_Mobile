import { PropertyService } from './propertyService';
import { httpClient } from '../../core/http/client';
import { ApiEndpoint, PropertyType } from '../../core/constants/enums';

jest.mock('../../core/http/client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and validate property list successfully', async () => {
    const backendData = [
      {
        _id: 'prop-1',
        nome: 'Residencial Aurora',
        tipo: PropertyType.Residencial,
        cidade: 'São Paulo',
      },
    ];

    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: backendData });

    const result = await PropertyService.getProperties();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith(ApiEndpoint.Properties);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Residencial Aurora');
  });

  it('should fetch simplified property names list', async () => {
    const backendData = [
      { _id: 'prop-1', nome: 'Residencial Aurora' },
      { _id: 'prop-2', nome: 'Comercial Paulista' },
    ];

    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: backendData });

    const result = await PropertyService.getPropertiesNames();

    expect(httpClient.get).toHaveBeenCalledWith(ApiEndpoint.PropertiesNames);
    expect(result).toEqual(backendData);
  });

  it('should create property when payload is valid', async () => {
    const requestPayload = {
      nome: 'Galpão Logístico',
      tipo: PropertyType.Industrial,
      cidade: 'Campinas',
    };
    const createdResponse = {
      _id: 'prop-3',
      nome: 'Galpão Logístico',
      tipo: PropertyType.Industrial,
      cidade: 'Campinas',
      rua: '',
      numero: '',
      bairro: '',
      estado: '',
      cep: '',
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: createdResponse });

    const result = await PropertyService.createProperty(requestPayload);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith(ApiEndpoint.Properties, expect.objectContaining({
      nome: 'Galpão Logístico',
      tipo: PropertyType.Industrial,
    }));
    expect(result).toEqual(createdResponse);
  });

  it('should throw validation error when creating property with invalid payload', async () => {
    const invalidPayload = {
      nome: 'X',
      tipo: 'Invalido' as any,
    };

    await expect(PropertyService.createProperty(invalidPayload)).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('should delete property successfully by ID', async () => {
    const propertyId = 'prop-valid-id';
    (httpClient.delete as jest.Mock).mockResolvedValueOnce({ status: 200 });

    await PropertyService.deleteProperty(propertyId);

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(httpClient.delete).toHaveBeenCalledWith(`${ApiEndpoint.Properties}/${propertyId}`);
  });

  it('should throw error when property ID is empty on delete', async () => {
    await expect(PropertyService.deleteProperty('')).rejects.toThrow('Property ID must be provided');
    await expect(PropertyService.deleteProperty('   ')).rejects.toThrow('Property ID must be provided');
    expect(httpClient.delete).not.toHaveBeenCalled();
  });
});
