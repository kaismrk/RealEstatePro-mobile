import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default:  { bg: colors.neutral100, text: colors.neutral600 },
  success:  { bg: colors.successBg,  text: colors.success },
  warning:  { bg: colors.warningBg,  text: colors.warning },
  error:    { bg: colors.errorBg,    text: colors.error },
  info:     { bg: colors.infoBg,     text: colors.info },
  accent:   { bg: colors.accentBg,    text: colors.accent },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
});
