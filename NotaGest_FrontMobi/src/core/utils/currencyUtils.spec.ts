import { formatBrlCurrency } from './currencyUtils';

describe('currencyUtils', () => {
  it('should format decimal values to Brazilian Real format', () => {
    const formatted = formatBrlCurrency(1250.5);
    expect(formatted).toContain('1.250,50');
    expect(formatted).toContain('R$');
  });

  it('should handle zero and null/undefined values gracefully', () => {
    expect(formatBrlCurrency(0)).toContain('0,00');
    expect(formatBrlCurrency(null)).toBe('R$ 0,00');
    expect(formatBrlCurrency(undefined)).toBe('R$ 0,00');
    expect(formatBrlCurrency(NaN)).toBe('R$ 0,00');
  });
});
