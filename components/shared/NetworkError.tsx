import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <View style={styles.container}>
      <Icon name="x" size={40} color={colors.textTertiary} />
      <Text style={styles.title}>Connection error</Text>
      <Text style={styles.message}>
        {message ?? 'Unable to load data. Check your connection and try again.'}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.retryText}>Retry</Text>
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
  title: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
});
