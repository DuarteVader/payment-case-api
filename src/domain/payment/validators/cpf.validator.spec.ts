import { isValidCpf } from './cpf.validator';

describe('isValidCpf', () => {
  it('should return true for a valid CPF', () => {
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('should return false for an invalid CPF', () => {
    expect(isValidCpf('12345678900')).toBe(false);
  });

  it('should return false for repeated digits', () => {
    expect(isValidCpf('11111111111')).toBe(false);
  });
});
