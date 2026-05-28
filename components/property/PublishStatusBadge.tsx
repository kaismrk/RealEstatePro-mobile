import { View, Text, StyleSheet } from 'react-native';
import type { PublishStatus } from '@/lib/types/property';
import { colors, radius, fontWeight } from '@/constants/theme';

interface PublishStatusBadgeProps {
  status: PublishStatus;
}

function statusLabel(status: PublishStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    case 'not_published':
      return 'Draft';
    default:
      return status;
  }
}

type StatusStyle = { container: object; text: object };

function statusStyles(status: PublishStatus): StatusStyle {
  switch (status) {
    case 'pending':
      return { container: styles.containerWarning, text: styles.textWarning };
    case 'rejected':
      return { container: styles.containerError, text: styles.textError };
    case 'not_published':
    default:
      return { container: styles.containerNeutral, text: styles.textNeutral };
  }
}

export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  const s = statusStyles(status);
  return (
    <View style={[styles.badge, s.container]}>
      <Text style={[styles.label, s.text]}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  containerWarning: {
    backgroundColor: colors.warningBg,
  },
  textWarning: {
    color: colors.warning,
  },
  containerError: {
    backgroundColor: colors.errorBg,
  },
  textError: {
    color: colors.error,
  },
  containerNeutral: {
    backgroundColor: colors.surfaceSunken,
  },
  textNeutral: {
    color: colors.textSecondary,
  },
});
