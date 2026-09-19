export function maskCepInput(text: string): string {
  const raw = text.replace(/\D/g, '');
  if (raw.length <= 5) {
    return raw;
  }
  return `${raw.slice(0, 5)}-${raw.slice(5, 8)}`;
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '');
}
