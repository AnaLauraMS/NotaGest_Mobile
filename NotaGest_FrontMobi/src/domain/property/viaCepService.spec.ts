import { ViaCepService } from './viaCepService';

describe('ViaCepService', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should sanitize non-digits from CEP string', () => {
    const sanitized = ViaCepService.sanitizeCep('01001-000');
    expect(sanitized).toBe('01001000');
  });

  it('should return null when sanitized CEP does not have 8 digits', async () => {
    const result = await ViaCepService.fetchAddressByCep('123');
    expect(result).toBeNull();
  });

  it('should fetch and parse valid address when CEP exists', async () => {
    const mockResponse = {
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const address = await ViaCepService.fetchAddressByCep('01001-000');

    expect(address).toEqual({
      rua: 'Praça da Sé',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
    });
  });

  it('should return null when ViaCEP returns erro true boolean', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ erro: true }),
    } as unknown as Response);

    const address = await ViaCepService.fetchAddressByCep('99999-999');
    expect(address).toBeNull();
  });

  it('should return null when ViaCEP returns erro string', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ erro: 'true' }),
    } as unknown as Response);

    const address = await ViaCepService.fetchAddressByCep('99999-999');
    expect(address).toBeNull();
  });

  it('should return null when response is not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn(),
    } as unknown as Response);

    const address = await ViaCepService.fetchAddressByCep('01001-000');
    expect(address).toBeNull();
  });

  it('should return null when fetch throws network error', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const address = await ViaCepService.fetchAddressByCep('01001-000');
    expect(address).toBeNull();
  });
});
