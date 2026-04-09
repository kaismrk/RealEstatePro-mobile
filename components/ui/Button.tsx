import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: string;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-blue-600 rounded-xl',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-white border border-blue-600 rounded-xl',
    text: 'text-blue-600 font-semibold',
  },
  ghost: {
    container: 'bg-transparent rounded-xl',
    text: 'text-blue-600 font-semibold',
  },
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2', text: 'text-sm' },
  md: { container: 'px-5 py-3', text: 'text-base' },
  lg: { container: 'px-6 py-4', text: 'text-lg' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyle = variantClasses[variant];
  const sizeStyle = sizeClasses[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${variantStyle.container} ${sizeStyle.container} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#006AFF'}
        />
      ) : (
        <Text className={`${variantStyle.text} ${sizeStyle.text}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
