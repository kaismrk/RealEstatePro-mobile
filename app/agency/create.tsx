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
      Alert.alert('Validation', 'Agency name is required.');
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
            'Failed to create agency. Please try again.';
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
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Agency</Text>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Field
          label="Agency Name"
          value={name}
          onChangeText={setName}
          placeholder="Your Real Estate Agency"
          required
        />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://example.com/logo.png"
          keyboardType="url"
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell potential clients about your agency…"
          multiline
        />

        <Text style={styles.sectionLabel}>Social Links</Text>
        <Field
          label="Website"
          value={website}
          onChangeText={setWebsite}
          placeholder="https://your-website.com"
          keyboardType="url"
        />
        <Field
          label="Facebook"
          value={facebook}
          onChangeText={setFacebook}
          placeholder="https://facebook.com/yourpage"
          keyboardType="url"
        />
        <Field
          label="Instagram"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="https://instagram.com/youraccount"
          keyboardType="url"
        />
        <Field
          label="Twitter / X"
          value={twitter}
          onChangeText={setTwitter}
          placeholder="https://x.com/youraccount"
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
            <Text style={styles.submitBtnText}>Create Agency</Text>
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
