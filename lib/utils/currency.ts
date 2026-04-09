export function formatPrice(
  amount: number | null | undefined,
  currency: string = 'TND'
): string {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}
