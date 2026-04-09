export function scorePassword(pw: string): 'weak' | 'good' | 'excellent' {
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const longEnough = pw.length >= 8;

  if (!longEnough || !hasUpper || !hasLower || !hasDigit) return 'weak';
  if (pw.length >= 12) return 'excellent';
  return 'good';
}
