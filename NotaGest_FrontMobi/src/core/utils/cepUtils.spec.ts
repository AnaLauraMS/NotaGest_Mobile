import { maskCepInput, cleanCep } from './cepUtils';

describe('cepUtils', () => {
  describe('maskCepInput', () => {
    it('should format numbers with dash after 5 digits', () => {
      expect(maskCepInput('01311')).toBe('01311');
      expect(maskCepInput('01311000')).toBe('01311-000');
      expect(maskCepInput('01311000999')).toBe('01311-000');
    });

    it('should strip non-digits', () => {
      expect(maskCepInput('01311-000')).toBe('01311-000');
      expect(maskCepInput('abc01311xyz000')).toBe('01311-000');
    });
  });

  describe('cleanCep', () => {
    it('should remove dash and non-digits', () => {
      expect(cleanCep('01311-000')).toBe('01311000');
      expect(cleanCep('01.311-000')).toBe('01311000');
    });
  });
});
