import {
  formatToBrlDate,
  parseBrlDateToIso,
  getTodayBrlDate,
  maskBrlDateInput,
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatToBrlDate', () => {
    it('should format ISO YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(formatToBrlDate('2021-10-29')).toBe('29/10/2021');
    });

    it('should format full ISO datetime to DD/MM/YYYY', () => {
      expect(formatToBrlDate('2021-10-29T14:30:00.000Z')).toBe('29/10/2021');
    });

    it('should return already formatted DD/MM/YYYY as is', () => {
      expect(formatToBrlDate('15/05/2023')).toBe('15/05/2023');
    });

    it('should return Data n/d if null or empty', () => {
      expect(formatToBrlDate(null)).toBe('Data n/d');
      expect(formatToBrlDate(undefined)).toBe('Data n/d');
      expect(formatToBrlDate('')).toBe('Data n/d');
    });
  });

  describe('parseBrlDateToIso', () => {
    it('should parse DD/MM/YYYY to YYYY-MM-DD', () => {
      expect(parseBrlDateToIso('29/10/2021')).toBe('2021-10-29');
    });

    it('should return non-slash string directly', () => {
      expect(parseBrlDateToIso('2021-10-29')).toBe('2021-10-29');
    });
  });

  describe('getTodayBrlDate', () => {
    it('should return today in DD/MM/YYYY format', () => {
      const today = getTodayBrlDate();
      expect(today).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('maskBrlDateInput', () => {
    it('should format numbers correctly as typing progresses', () => {
      expect(maskBrlDateInput('2')).toBe('2');
      expect(maskBrlDateInput('29')).toBe('29');
      expect(maskBrlDateInput('291')).toBe('29/1');
      expect(maskBrlDateInput('2910')).toBe('29/10');
      expect(maskBrlDateInput('29102')).toBe('29/10/2');
      expect(maskBrlDateInput('29102021')).toBe('29/10/2021');
      expect(maskBrlDateInput('29102021999')).toBe('29/10/2021');
    });
  });
});
