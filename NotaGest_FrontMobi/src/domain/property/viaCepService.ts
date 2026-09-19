import { z } from 'zod';

export const viaCepResponseSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional().default(''),
  bairro: z.string().optional().default(''),
  localidade: z.string().optional().default(''),
  uf: z.string().optional().default(''),
  erro: z.union([z.boolean(), z.string()]).optional(),
});

export type ViaCepAddress = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export class ViaCepService {
  static sanitizeCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  static async fetchAddressByCep(rawCep: string): Promise<ViaCepAddress | null> {
    const cleanCep = this.sanitizeCep(rawCep);
    if (cleanCep.length !== 8) {
      return null;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      const parsed = viaCepResponseSchema.safeParse(data);
      if (!parsed.success || parsed.data.erro === true || parsed.data.erro === 'true') {
        return null;
      }

      return {
        rua: parsed.data.logradouro,
        bairro: parsed.data.bairro,
        cidade: parsed.data.localidade,
        estado: parsed.data.uf,
      };
    } catch {
      return null;
    }
  }
}
