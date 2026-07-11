import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { AuthGate } from '@/components/auth/AuthGate';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/inputs/PhoneInput';
import type { PhoneValue } from '@/components/inputs/PhoneInput';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUser';
import { colors, fontWeight, radius } from '@/constants/theme';

function EditProfileContent() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const countryCode = useAuthStore((s) => s.countryCode);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneValue, setPhoneValue] = useState<PhoneValue>({ raw: '', e164: '', isValid: false });
  const [errors, setErrors] = useState<{ email?: string }>({});

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setEmail(user.email);

      const stored = user.phone_e164 ?? '';
      if (stored) {
        const parsed = parsePhoneNumberFromString(stored, countryCode as CountryCode);
        setPhoneValue({
          raw: parsed?.formatInternational() ?? stored,
          e164: parsed?.format('E.164') ?? stored,
          isValid: parsed?.isValid() ?? false,
        });
      }
    }
  }, [user, countryCode]);

  function validate(): boolean {
    const newErrors: { email?: string } = {};
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t('editProfile.email.error');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: { first_name?: string; last_name?: string; email?: string; phone_e164?: string | null } = {};
    if (firstName.trim() !== (user?.first_name ?? '')) {
      payload.first_name = firstName.trim() || undefined;
    }
    if (lastName.trim() !== (user?.last_name ?? '')) {
      payload.last_name = lastName.trim() || undefined;
    }
    if (email.trim() && email.trim() !== user?.email) {
      payload.email = email.trim();
    }
    // Always send phone_e164 when it has a value (even unchanged — backend is idempotent)
    if (phoneValue.isValid) {
      payload.phone_e164 = phoneValue.e164;
    } else if (phoneValue.raw.trim() === '' && (user?.phone_e164 ?? '') !== '') {
      // User cleared the field — send null to clear on backend
      payload.phone_e164 = null;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        Alert.alert(t('common.success'), t('editProfile.success'));
        router.back();
      },
      onError: (err) => {
        Alert.alert(t('common.error'), err.message ?? t('editProfile.error'));
      },
    });
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('editProfile.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="chevron-left" size={20} color={colors.primary} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editProfile.header.title')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('editProfile.firstName.label')}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t('editProfile.firstName.placeholder')}
            autoCorrect={false}
          />

          <Input
            label={t('editProfile.lastName.label')}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t('editProfile.lastName.placeholder')}
            autoCorrect={false}
          />

          <Input
            label={t('editProfile.email.label')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({});
            }}
            error={errors.email}
            placeholder={t('editProfile.email.placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PhoneInput
            countryCode={countryCode}
            value={phoneValue.raw}
            onValueChange={setPhoneValue}
          />

          {/* Country read-only (FINDING-011: not editable) */}
          {user?.country_code ? (
            <View style={styles.countryField}>
              <Text style={styles.countryLabel}>{t('editProfile.country.label')}</Text>
              <View style={styles.countryValue}>
                <Text style={styles.countryText}>{user.country_code}</Text>
              </View>
              <Text style={styles.countryHint}>
                {t('editProfile.country.hint')}
              </Text>
            </View>
          ) : null}

          <Button
            onPress={handleSave}
            loading={updateProfile.isPending}
            size="lg"
            style={styles.submitButton}
          >
            {t('editProfile.submit')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EditProfileScreen() {
  return (
    <AuthGate>
      <EditProfileContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
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
  form: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  countryField: {
    marginBottom: 16,
  },
  countryLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  countryValue: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSunken,
  },
  countryText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  countryHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
  },
});
