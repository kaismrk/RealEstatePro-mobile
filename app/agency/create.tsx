import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCreateAgency } from '@/hooks/useAgencies';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  required,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: 'default' | 'url';
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.fieldRequired}> *</Text>}
      </Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function CreateAgencyScreen() {
  const { t } = useTranslation();
  const countryCode = useAuthStore((s) => s.countryCode);
  const create = useCreateAgency();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation', t('agency.create.validation.nameRequired'));
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (website.trim()) socialLinks.website = website.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (twitter.trim()) socialLinks.twitter = twitter.trim();

    create.mutate(
      {
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        country_code: countryCode,
      },
      {
        onSuccess: () => {
          router.replace('/agency/manage');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            t('agency.create.error');
          Alert.alert('Error', msg);
        },
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerBack}
        >
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agency.create.title')}</Text>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Field
          label={t('agency.create.fields.name.label')}
          value={name}
          onChangeText={setName}
          placeholder={t('agency.create.fields.name.placeholder')}
          required
        />
        <Field
          label={t('agency.create.fields.logoUrl.label')}
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder={t('agency.create.fields.logoUrl.placeholder')}
          keyboardType="url"
        />
        <Field
          label={t('agency.create.fields.description.label')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('agency.create.fields.description.placeholder')}
          multiline
        />

        <Text style={styles.sectionLabel}>{t('agency.create.fields.socialLinks')}</Text>
        <Field
          label={t('agency.create.fields.website.label')}
          value={website}
          onChangeText={setWebsite}
          placeholder={t('agency.create.fields.website.placeholder')}
          keyboardType="url"
        />
        <Field
          label={t('agency.create.fields.facebook.label')}
          value={facebook}
          onChangeText={setFacebook}
          placeholder={t('agency.create.fields.facebook.placeholder')}
          keyboardType="url"
        />
        <Field
          label={t('agency.create.fields.instagram.label')}
          value={instagram}
          onChangeText={setInstagram}
          placeholder={t('agency.create.fields.instagram.placeholder')}
          keyboardType="url"
        />
        <Field
          label={t('agency.create.fields.twitter.label')}
          value={twitter}
          onChangeText={setTwitter}
          placeholder={t('agency.create.fields.twitter.placeholder')}
          keyboardType="url"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, create.isPending && styles.submitBtnPending]}
          onPress={handleSubmit}
          disabled={create.isPending}
          accessibilityRole="button"
          accessibilityLabel="Create agency"
        >
          {create.isPending ? (
            <ActivityIndicator size="small" color={colors.textOnBrand} />
          ) : (
            <Text style={styles.submitBtnText}>{t('agency.create.submit')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldRequired: {
    color: colors.error,
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitBtnPending: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
});
