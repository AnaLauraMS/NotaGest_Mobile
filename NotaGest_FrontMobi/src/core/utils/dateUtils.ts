export function formatToBrlDate(dateString?: string | null): string {
  if (!dateString) return 'Data n/d';
  try {
    const clean = dateString.split('T')[0];
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year.length === 4) {
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }
    }
    if (clean.includes('/')) {
      return clean;
    }
  } catch {}
  return dateString;
}

export function parseBrlDateToIso(dateStr: string): string {
  const clean = dateStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  return clean;
}

export function getTodayBrlDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function maskBrlDateInput(text: string): string {
  const raw = text.replace(/\D/g, '');
  if (raw.length <= 2) {
    return raw;
  }
  if (raw.length <= 4) {
    return `${raw.slice(0, 2)}/${raw.slice(2)}`;
  }
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4, 8)}`;
}
