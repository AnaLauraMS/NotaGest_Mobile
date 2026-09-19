import { z } from 'zod';

export const invoicePropertySchema = z.union([
  z.object({
    _id: z.string(),
    nome: z.string(),
  }),
  z.string(),
]);

export const invoiceResponseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  value: z.number(),
  purchaseDate: z.string(),
  property: invoicePropertySchema.optional().nullable(),
  category: z.string().optional().default('Geral'),
  subcategory: z.string().optional().default(''),
  observation: z.string().optional().default(''),
  filePath: z.string().optional().default(''),
  createdAt: z.string().optional(),
});

export const invoiceListResponseSchema = z.array(invoiceResponseSchema);

export const createInvoiceRequestSchema = z.object({
  title: z.string().min(2),
  value: z.number().positive(),
  purchaseDate: z.string(),
  property: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  observation: z.string().optional().default(''),
  filePath: z.string().optional().default(''),
});

export type InvoiceResponse = z.infer<typeof invoiceResponseSchema>;
export type CreateInvoiceRequest = z.input<typeof createInvoiceRequestSchema>;

export const aiExtractDataSchema = z.object({
  title: z.string().optional().default(''),
  totalValue: z.number().nullable().optional(),
  emissionDate: z.string().optional().default(''),
  observation: z.string().optional().default(''),
  category: z.string().optional().default('Construção'),
  subcategory: z.string().optional().default('Outros'),
  successStatus: z.enum(['FULL', 'PARTIAL', 'FAILED']).optional(),
  aiMessage: z.string().optional().default(''),
});

export const aiExtractResponseSchema = z.object({
  message: z.string().optional(),
  data: aiExtractDataSchema,
  filePath: z.string().optional(),
});

export type AiExtractResponse = z.infer<typeof aiExtractResponseSchema>;
export type AiExtractData = z.infer<typeof aiExtractDataSchema>;
