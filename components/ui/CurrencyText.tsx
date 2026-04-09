import { Text, type TextProps } from 'react-native';
import { formatPrice } from '@/lib/utils/currency';

interface CurrencyTextProps extends TextProps {
  amount: number | null | undefined;
  currency?: string;
}

export function CurrencyText({
  amount,
  currency = 'TND',
  ...props
}: CurrencyTextProps) {
  return <Text {...props}>{formatPrice(amount, currency)}</Text>;
}
