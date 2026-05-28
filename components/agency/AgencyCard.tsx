import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { AgencyResponse } from '@/hooks/useAgencies';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';

interface AgencyCardProps {
  agency: AgencyResponse;
  onPress?: () => void;
}

export function AgencyCard({ agency, onPress }: AgencyCardProps) {
  const snippet =
    agency.description && agency.description.length > 80
      ? agency.description.slice(0, 80) + '…'
      : (agency.description ?? '');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`View agency ${agency.name}`}
    >
      {agency.logo_url ? (
        <Image
          source={{ uri: agency.logo_url }}
          style={styles.logo}
          resizeMode="cover"
          accessibilityLabel={`${agency.name} logo`}
        />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Icon name="home" size={28} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {agency.name}
        </Text>
        {snippet.length > 0 && (
          <Text style={styles.description} numberOfLines={2}>
            {snippet}
          </Text>
        )}
        <Text style={styles.countryCode}>{agency.country_code}</Text>
      </View>

      <Icon name="chevron-right" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countryCode: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
