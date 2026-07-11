import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  /** Pass a string emoji for legacy callers, or a React element (e.g. <Icon …>) for icon components. */
  icon?: string | ReactNode;
  action?: EmptyStateAction;
}

export function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
  const iconNode =
    typeof icon === 'string'
      ? <Text style={styles.icon}>{icon}</Text>
      : icon
        ? <View style={styles.iconWrap}>{icon}</View>
        : null;

  return (
    <View style={styles.container}>
      {iconNode}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? (
        <TouchableOpacity style={styles.action} onPress={action.onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={action.label}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  iconWrap: { marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  action: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  actionLabel: {
    color: colors.textOnBrand,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
  },
});
