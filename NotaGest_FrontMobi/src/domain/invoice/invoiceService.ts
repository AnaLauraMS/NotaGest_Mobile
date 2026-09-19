import { httpClient } from '../../core/http/client';
import { ApiEndpoint } from '../../core/constants/enums';
import {
  AiExtractResponse,
  CreateInvoiceRequest,
  InvoiceResponse,
  aiExtractResponseSchema,
  createInvoiceRequestSchema,
  invoiceListResponseSchema,
  invoiceResponseSchema,
} from './schemas';

export class InvoiceService {
  public static async getInvoices(propertyId?: string): Promise<InvoiceResponse[]> {
    const url = propertyId
      ? `${ApiEndpoint.Invoices}?propertyId=${encodeURIComponent(propertyId)}`
      : ApiEndpoint.Invoices;
    const response = await httpClient.get(url);
    return invoiceListResponseSchema.parse(response.data);
  }

  public static async createInvoice(payload: CreateInvoiceRequest): Promise<InvoiceResponse> {
    const validatedPayload = createInvoiceRequestSchema.parse(payload);
    const response = await httpClient.post(ApiEndpoint.Invoices, validatedPayload);
    return invoiceResponseSchema.parse(response.data);
  }

  public static async deleteInvoice(invoiceId: string): Promise<void> {
    if (!invoiceId || invoiceId.trim() === '') {
      throw new Error('Invoice ID must be provided');
    }
    await httpClient.delete(`${ApiEndpoint.Invoices}/${invoiceId}`);
  }

  public static async extractInvoiceWithAi(fileUri: string, mimeType?: string): Promise<AiExtractResponse> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'invoice.jpg';
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType || 'image/jpeg',
    } as any);

    const response = await httpClient.post(ApiEndpoint.AiExtract, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return aiExtractResponseSchema.parse(response.data);
  }
}
