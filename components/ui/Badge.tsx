import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-gray-100', text: 'text-gray-700' },
  success: { container: 'bg-green-100', text: 'text-green-700' },
  warning: { container: 'bg-yellow-100', text: 'text-yellow-700' },
  error: { container: 'bg-red-100', text: 'text-red-700' },
  info: { container: 'bg-blue-100', text: 'text-blue-700' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const style = variantClasses[variant];
  return (
    <View className={`${style.container} px-2 py-1 rounded-full self-start`}>
      <Text className={`${style.text} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
