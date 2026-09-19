import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

export const authUserSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().email(),
});

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
});

export const registerRequestSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
});

export const userProfileSchema = z.object({
  _id: z.string(),
  nome: z.string(),
  email: z.string().email(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
