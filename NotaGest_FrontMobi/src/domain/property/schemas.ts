import { z } from 'zod';
import { PropertyType } from '../../core/constants/enums';

export { PropertyType };

export const propertyTypeSchema = z.nativeEnum(PropertyType);

export const createPropertyRequestSchema = z.object({
  nome: z.string().min(2),
  tipo: propertyTypeSchema.default(PropertyType.Residencial),
  rua: z.string().optional().default(''),
  numero: z.string().optional().default(''),
  bairro: z.string().optional().default(''),
  cidade: z.string().optional().default(''),
  estado: z.string().optional().default(''),
  cep: z.string().optional().default(''),
});

export const propertyResponseSchema = z.object({
  _id: z.string(),
  nome: z.string(),
  tipo: z.string().optional().default(PropertyType.Residencial),
  rua: z.string().optional().default(''),
  numero: z.string().optional().default(''),
  bairro: z.string().optional().default(''),
  cidade: z.string().optional().default(''),
  estado: z.string().optional().default(''),
  cep: z.string().optional().default(''),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const propertyListResponseSchema = z.array(propertyResponseSchema);

export const propertySimpleNameSchema = z.object({
  _id: z.string(),
  nome: z.string(),
});

export const propertySimpleNameListSchema = z.array(propertySimpleNameSchema);

export type CreatePropertyRequest = z.input<typeof createPropertyRequestSchema>;
export type PropertyResponse = z.infer<typeof propertyResponseSchema>;
export type PropertySimpleName = z.infer<typeof propertySimpleNameSchema>;
