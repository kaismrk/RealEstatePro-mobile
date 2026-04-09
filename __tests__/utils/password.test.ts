import { scorePassword } from '../../lib/utils/password';

describe('scorePassword', () => {
  it('returns weak for very short password', () => {
    expect(scorePassword('abc')).toBe('weak');
  });

  it('returns weak for 8-char password with no uppercase or digit', () => {
    expect(scorePassword('abcdefgh')).toBe('weak');
  });

  it('returns weak for password missing digit', () => {
    expect(scorePassword('Abcdefgh')).toBe('weak');
  });

  it('returns weak for password missing uppercase', () => {
    expect(scorePassword('abcdefg1')).toBe('weak');
  });

  it('returns good for 8-char password meeting all rules', () => {
    expect(scorePassword('Abc12345')).toBe('good');
  });

  it('returns excellent for long password meeting all rules', () => {
    expect(scorePassword('Abc123456789!')).toBe('excellent');
  });

  it('returns excellent for exactly 12-char password meeting all rules', () => {
    expect(scorePassword('Abcdefgh1234')).toBe('excellent');
  });
});
