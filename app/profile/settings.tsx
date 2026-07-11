import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
// Linking is kept for Open-Source Licenses (external URL).
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { MenuRow } from '@/components/profile/MenuRow';
import { colors, fontWeight } from '@/constants/theme';
import { useTheme, type ThemeMode } from '@/lib/theme';
import i18n from '@/lib/i18n';
import { persistLanguage } from '@/lib/i18n/detect';

const APP_VERSION =
  (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

const LANGUAGE_OPTIONS: Array<{ label: string; code: string }> = [
  { label: 'Français', code: 'fr' },
  { label: 'English', code: 'en' },
];

const THEME_OPTIONS: Array<{ labelKey: string; mode: ThemeMode }> = [
  { labelKey: 'settings.theme.system', mode: 'system' },
  { labelKey: 'settings.theme.light',  mode: 'light'  },
  { labelKey: 'settings.theme.dark',   mode: 'dark'   },
];

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsRowLabel}>{label}</Text>
      <Text style={styles.settingsRowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const countryCode = useAuthStore((s) => s.countryCode);
  const setCountry = useAuthStore((s) => s.setCountry);
  const logout = useLogout();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  const [langPickerVisible, setLangPickerVisible] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const currentLang = i18n.language;

  function handleCountrySelect(code: string) {
    void setCountry(code);
    queryClient.clear();
  }

  async function handleLanguageSelect(code: string) {
    setLangPickerVisible(false);
    await persistLanguage(code);
    await i18n.changeLanguage(code);
  }

  async function handleThemeSelect(mode: ThemeMode) {
    setThemePickerVisible(false);
    await setThemeMode(mode);
  }

  function handleSignOut() {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: () => logout.mutate(),
      },
    ]);
  }

  const currentLangLabel =
    LANGUAGE_OPTIONS.find((o) => o.code === currentLang)?.label ?? currentLang;

  const currentThemeLabel = t(
    THEME_OPTIONS.find((o) => o.mode === themeMode)?.labelKey ?? 'settings.theme.system'
  );

  return (
    <ScrollView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={20} color={colors.primary} />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.header.title')}</Text>
      </View>

      {/* Region */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.section.region')}</Text>
        <View style={styles.sectionBody}>
          <View style={styles.countryRow}>
            <Text style={styles.countryRowLabel}>{t('settings.country')}</Text>
            <CountrySelector selectedCode={countryCode} onSelect={handleCountrySelect} />
          </View>

          {/* Language picker row */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setLangPickerVisible(true)}
            accessibilityLabel={t('settings.language')}
          >
            <Text style={styles.settingsRowLabel}>{t('settings.language')}</Text>
            <View style={styles.langRowRight}>
              <Text style={styles.settingsRowValue}>{currentLangLabel}</Text>
              <Icon name="chevron-right" size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Theme picker row */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setThemePickerVisible(true)}
            accessibilityLabel={t('settings.themeLabel')}
          >
            <Text style={styles.settingsRowLabel}>{t('settings.themeLabel')}</Text>
            <View style={styles.langRowRight}>
              <Text style={styles.settingsRowValue}>{currentThemeLabel}</Text>
              <Icon name="chevron-right" size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.section.about')}</Text>
        <View style={styles.sectionBody}>
          <SettingsRow label={t('settings.appVersion')} value={APP_VERSION} />
          <MenuRow
            icon="edit"
            label={t('settings.legal.terms')}
            onPress={() => router.push('/profile/legal/terms')}
          />
          <MenuRow
            icon="privacy"
            label={t('settings.legal.privacy')}
            onPress={() => router.push('/profile/legal/privacy')}
          />
          <MenuRow
            icon="gift"
            label={t('settings.legal.licenses')}
            onPress={() => void Linking.openURL('https://admin.hovioo.com/licenses')}
          />
        </View>
      </View>

      {/* Sign out */}
      <View style={[styles.section, styles.sectionLast]}>
        <Text style={styles.sectionLabel}>{t('settings.section.accountActions')}</Text>
        <View style={styles.sectionBody}>
          <MenuRow
            icon="logout"
            label={t('profile.signOut')}
            onPress={handleSignOut}
            destructive
          />
        </View>
      </View>

      {/* Language picker modal */}
      <Modal
        visible={langPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setLangPickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.picker.title')}</Text>
              <TouchableOpacity onPress={() => setLangPickerVisible(false)}>
                <Text style={styles.modalClose}>{t('settings.picker.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGE_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langOption}
                  onPress={() => void handleLanguageSelect(item.code)}
                  accessibilityLabel={item.label}
                >
                  <Text style={styles.langOptionLabel}>{item.label}</Text>
                  {currentLang === item.code && (
                    <Icon name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Theme picker modal — same pattern as language picker */}
      <Modal
        visible={themePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setThemePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setThemePickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.picker.themeTitle')}</Text>
              <TouchableOpacity onPress={() => setThemePickerVisible(false)}>
                <Text style={styles.modalClose}>{t('settings.picker.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={THEME_OPTIONS}
              keyExtractor={(item) => item.mode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langOption}
                  onPress={() => void handleThemeSelect(item.mode)}
                  accessibilityLabel={t(item.labelKey)}
                >
                  <Text style={styles.langOptionLabel}>{t(item.labelKey)}</Text>
                  {themeMode === item.mode && (
                    <Icon name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  langRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: 15,
    color: colors.primary,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  langOptionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});
