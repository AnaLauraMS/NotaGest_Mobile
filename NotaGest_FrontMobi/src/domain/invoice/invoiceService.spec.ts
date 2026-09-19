import { httpClient } from '../../core/http/client';
import { InvoiceService } from './invoiceService';
import { ApiEndpoint } from '../../core/constants/enums';

jest.mock('../../core/http/client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('InvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve list of invoices without property filter', async () => {
    const mockInvoices = [
      {
        _id: 'inv-1',
        title: 'Material Hidráulico',
        value: 1200.5,
        purchaseDate: '2026-09-15',
        property: { _id: 'prop-1', nome: 'Residencial Aurora' },
        category: 'Construção',
        subcategory: 'Hidráulica',
        observation: 'Tubos e conexões',
        filePath: 'uploads/file1.pdf',
        createdAt: '2026-09-15T10:00:00.000Z',
      },
    ];

    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: mockInvoices });

    const result = await InvoiceService.getInvoices();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith(ApiEndpoint.Invoices);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Material Hidráulico');
    expect(result[0].value).toBe(1200.5);
  });

  it('should retrieve list of invoices with propertyId query parameter', async () => {
    const mockInvoices: any[] = [];
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: mockInvoices });

    const result = await InvoiceService.getInvoices('prop-99');

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith(`${ApiEndpoint.Invoices}?propertyId=prop-99`);
    expect(result).toEqual([]);
  });

  it('should create an invoice successfully', async () => {
    const payload = {
      title: 'Tintas Coral',
      value: 650,
      purchaseDate: '2026-09-18',
      property: 'prop-1',
      category: 'Reforma',
      subcategory: 'Pintura',
      observation: '2 latas de tinta branca',
    };

    const mockResponse = {
      _id: 'inv-created',
      title: payload.title,
      value: payload.value,
      purchaseDate: payload.purchaseDate,
      property: 'prop-1',
      category: payload.category,
      subcategory: payload.subcategory,
      observation: payload.observation,
      filePath: '',
      createdAt: '2026-09-18T12:00:00.000Z',
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

    const result = await InvoiceService.createInvoice(payload);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith(ApiEndpoint.Invoices, expect.objectContaining(payload));
    expect(result._id).toBe('inv-created');
    expect(result.title).toBe('Tintas Coral');
  });

  it('should reject creating an invoice with invalid payload', async () => {
    const invalidPayload = {
      title: 'T',
      value: -10,
      purchaseDate: '',
      property: '',
      category: '',
      subcategory: '',
    };

    await expect(InvoiceService.createInvoice(invalidPayload as any)).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('should delete an invoice by ID', async () => {
    (httpClient.delete as jest.Mock).mockResolvedValueOnce({});

    await InvoiceService.deleteInvoice('inv-to-delete');

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(httpClient.delete).toHaveBeenCalledWith(`${ApiEndpoint.Invoices}/inv-to-delete`);
  });

  it('should throw error when deleting invoice with empty ID', async () => {
    await expect(InvoiceService.deleteInvoice('')).rejects.toThrow('Invoice ID must be provided');
    await expect(InvoiceService.deleteInvoice('   ')).rejects.toThrow('Invoice ID must be provided');
    expect(httpClient.delete).not.toHaveBeenCalled();
  });

  it('should extract invoice data using AI with specified mime type', async () => {
    const mockAiResponse = {
      message: 'Extração concluída',
      data: {
        title: 'Materiais de Construção São Paulo',
        totalValue: 345.8,
        emissionDate: '2026-09-19',
        category: 'Construção',
        subcategory: 'Alvenaria',
        observation: 'Cimento e areia',
        successStatus: 'FULL',
        aiMessage: 'Dados extraídos com alta confiança',
      },
      filePath: 'uploads/ai_recibo.jpg',
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAiResponse });

    const result = await InvoiceService.extractInvoiceWithAi('file:///data/user/0/receipt.png', 'image/png');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith(
      ApiEndpoint.AiExtract,
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    expect(result.data.title).toBe('Materiais de Construção São Paulo');
    expect(result.data.totalValue).toBe(345.8);
    expect(result.data.category).toBe('Construção');
    expect(result.filePath).toBe('uploads/ai_recibo.jpg');
  });

  it('should extract invoice data using AI with default mime type and fallback filename', async () => {
    const mockAiResponse = {
      data: {
        title: 'Recibo Balcão',
        totalValue: 50.0,
        emissionDate: '2026-09-18',
        category: 'Outros',
        subcategory: 'Diversos',
        observation: '',
      },
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: mockAiResponse });

    const result = await InvoiceService.extractInvoiceWithAi('simple_path');

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(result.data.title).toBe('Recibo Balcão');
    expect(result.data.totalValue).toBe(50.0);
  });

  it('should reject invalid response schema from AI extraction', async () => {
    const invalidAiResponse = {
      data: {
        successStatus: 'INVALID_STATUS',
      },
    };

    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: invalidAiResponse });

    await expect(
      InvoiceService.extractInvoiceWithAi('file:///receipt.jpg')
    ).rejects.toThrow();
  });
});
