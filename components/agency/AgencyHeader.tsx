import { View, Text, Image, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import type { AgencyResponse } from '@/hooks/useAgencies';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

interface AgencyHeaderProps {
  agency: AgencyResponse;
}

export function AgencyHeader({ agency }: AgencyHeaderProps) {
  const website = agency.social_links?.website ?? null;

  function handleWebsite() {
    if (website) {
      Linking.openURL(website).catch(() => {
        // Silently ignore if URL cannot be opened
      });
    }
  }

  return (
    <View style={styles.container}>
      {agency.logo_url ? (
        <Image
          source={{ uri: agency.logo_url }}
          style={styles.logo}
          resizeMode="cover"
          accessibilityLabel={`${agency.name} logo`}
        />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Icon name="home" size={48} color={colors.primary} />
        </View>
      )}

      <Text style={styles.name}>{agency.name}</Text>
      <Text style={styles.countryCode}>{agency.country_code}</Text>

      {agency.description ? (
        <Text style={styles.description}>{agency.description}</Text>
      ) : null}

      {website ? (
        <TouchableOpacity
          onPress={handleWebsite}
          accessibilityRole="link"
          accessibilityLabel="Open agency website"
        >
          <Text style={styles.websiteLink}>{website}</Text>
        </TouchableOpacity>
      ) : null}

      {/* Social links row */}
      {agency.social_links && (
        <View style={styles.socialRow}>
          {agency.social_links.facebook ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.facebook!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Facebook"
            >
              <Text style={styles.socialLinkPrimary}>Facebook</Text>
            </TouchableOpacity>
          ) : null}
          {agency.social_links.instagram ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.instagram!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Instagram"
            >
              <Text style={styles.socialLinkInstagram}>Instagram</Text>
            </TouchableOpacity>
          ) : null}
          {agency.social_links.twitter ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.twitter!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Twitter / X"
            >
              <Text style={styles.socialLinkTwitter}>X / Twitter</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.surface,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: radius.xl2,
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: radius.xl2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 14,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  websiteLink: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  socialLinkPrimary: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
  socialLinkInstagram: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
  socialLinkTwitter: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
});
