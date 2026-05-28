import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { MenuRow } from '@/components/profile/MenuRow';
import { colors, fontWeight } from '@/constants/theme';

const APP_VERSION =
  (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsRowLabel}>{label}</Text>
      <Text style={styles.settingsRowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const countryCode = useAuthStore((s) => s.countryCode);
  const setCountry = useAuthStore((s) => s.setCountry);
  const logout = useLogout();

  function handleCountrySelect(code: string) {
    void setCountry(code);
    queryClient.clear();
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout.mutate(),
      },
    ]);
  }

  return (
    <ScrollView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>

      {/* Region */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Region</Text>
        <View style={styles.sectionBody}>
          <View style={styles.countryRow}>
            <Text style={styles.countryRowLabel}>Country</Text>
            <CountrySelector selectedCode={countryCode} onSelect={handleCountrySelect} />
          </View>
          <SettingsRow label="Language" value="English" />
          <SettingsRow label="Theme" value="Light" />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.sectionBody}>
          <SettingsRow label="App Version" value={APP_VERSION} />
          <MenuRow
            icon="📄"
            label="Terms of Use"
            onPress={() => void Linking.openURL('https://example.com/terms')}
          />
          <MenuRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => void Linking.openURL('https://example.com/privacy')}
          />
          <MenuRow
            icon="📦"
            label="Open-Source Licenses"
            onPress={() => void Linking.openURL('https://example.com/licenses')}
          />
        </View>
      </View>

      {/* Sign out */}
      <View style={[styles.section, styles.sectionLast]}>
        <Text style={styles.sectionLabel}>Account Actions</Text>
        <View style={styles.sectionBody}>
          <MenuRow
            icon="🚪"
            label="Sign Out"
            onPress={handleSignOut}
            destructive
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionLast: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsRowLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingsRowValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryRowLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});
