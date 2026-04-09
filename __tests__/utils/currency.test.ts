import { formatPrice } from '../../lib/utils/currency';

describe('formatPrice', () => {
  it('formats a TND amount containing 250,000', () => {
    const result = formatPrice(250000, 'TND');
    expect(result).toContain('250,000');
  });

  it('formats 0 EUR without throwing', () => {
    const result = formatPrice(0, 'EUR');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Should contain "0" somewhere
    expect(result).toMatch(/0/);
  });

  it('formats a large USD amount', () => {
    const result = formatPrice(1500000, 'USD');
    expect(result).toContain('1,500,000');
  });

  it('returns em dash for null amount', () => {
    expect(formatPrice(null, 'TND')).toBe('—');
  });

  it('returns em dash for undefined amount', () => {
    expect(formatPrice(undefined, 'TND')).toBe('—');
  });
});
