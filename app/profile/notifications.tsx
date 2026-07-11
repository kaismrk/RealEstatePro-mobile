import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { AuthGate } from '@/components/auth/AuthGate';
import { colors, fontWeight, radius } from '@/constants/theme';

interface NotificationToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  value,
  onValueChange,
}: NotificationToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? (
          <Text style={styles.toggleDescription}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.info }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

function NotificationsContent() {
  const { t } = useTranslation();
  const [matchingListings, setMatchingListings] = useState(false);
  const [inquiries, setInquiries] = useState(false);
  const [priceChanges, setPriceChanges] = useState(false);
  const [appNews, setAppNews] = useState(false);

  return (
    <ScrollView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={20} color={colors.primary} />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.header.title')}</Text>
      </View>

      {/* Coming soon banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{t('notifications.banner.title')}</Text>
        <Text style={styles.bannerSubtitle}>
          {t('notifications.banner.subtitle')}
        </Text>
      </View>

      {/* Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('notifications.section.push')}</Text>
        <View style={styles.sectionBody}>
          <NotificationToggle
            label={t('notifications.items.matchingListings.label')}
            description={t('notifications.items.matchingListings.description')}
            value={matchingListings}
            onValueChange={setMatchingListings}
          />
          <NotificationToggle
            label={t('notifications.items.inquiries.label')}
            description={t('notifications.items.inquiries.description')}
            value={inquiries}
            onValueChange={setInquiries}
          />
          <NotificationToggle
            label={t('notifications.items.priceChanges.label')}
            description={t('notifications.items.priceChanges.description')}
            value={priceChanges}
            onValueChange={setPriceChanges}
          />
          <NotificationToggle
            label={t('notifications.items.appNews.label')}
            description={t('notifications.items.appNews.description')}
            value={appNews}
            onValueChange={setAppNews}
          />
        </View>
      </View>

      {/* Static email note */}
      <View style={styles.emailNote}>
        <Text style={styles.emailNoteText}>
          {t('notifications.emailNote')}
        </Text>
      </View>
    </ScrollView>
  );
}

export default function NotificationsScreen() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
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
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#c8a9ff',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerTitle: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: fontWeight.medium,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  emailNote: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  emailNoteText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
