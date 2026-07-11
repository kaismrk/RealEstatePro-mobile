import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { AuthGate } from '@/components/auth/AuthGate';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useChangePassword } from '@/hooks/useUser';
import { colors, fontWeight, radius } from '@/constants/theme';

// Minimum password policy (matches backend)
function meetsPolicy(pw: string): boolean {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw)
  );
}

function ChangePasswordContent() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  function validate(): boolean {
    const errs: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errs.current = t('changePassword.errors.currentRequired');
    }
    if (!newPassword) {
      errs.new = t('changePassword.errors.newRequired');
    } else if (!meetsPolicy(newPassword)) {
      errs.new = t('changePassword.errors.policy');
    }
    if (!confirmPassword) {
      errs.confirm = t('changePassword.errors.confirmRequired');
    } else if (newPassword !== confirmPassword) {
      errs.confirm = t('changePassword.errors.mismatch');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    changePassword.mutate(
      { password: newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            t('changePassword.success.title'),
            t('changePassword.success.body'),
            [{ text: 'OK' }]
          );
        },
        onError: (err) => {
          const message = err.message ?? t('changePassword.error');
          if (message.toLowerCase().includes('401') || message.toLowerCase().includes('unauthorized')) {
            setErrors({ current: t('changePassword.errors.currentIncorrect') });
          } else {
            Alert.alert(t('common.error'), message);
          }
        },
      }
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
          <Text style={styles.headerTitle}>{t('changePassword.header.title')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.hint}>
            {t('changePassword.hint')}
          </Text>

          <Input
            label={t('changePassword.currentPassword.label')}
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (errors.current) setErrors((e) => ({ ...e, current: undefined }));
            }}
            error={errors.current}
            placeholder={t('changePassword.currentPassword.placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label={t('changePassword.newPassword.label')}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.new) setErrors((e) => ({ ...e, new: undefined }));
            }}
            error={errors.new}
            placeholder={t('changePassword.newPassword.placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {newPassword.length > 0 ? (
            <PasswordStrengthMeter password={newPassword} />
          ) : null}

          <Input
            label={t('changePassword.confirmPassword.label')}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
            }}
            error={errors.confirm}
            placeholder={t('changePassword.confirmPassword.placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            onPress={handleSubmit}
            loading={changePassword.isPending}
            size="lg"
            style={styles.submitButton}
          >
            {t('changePassword.submit')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ChangePasswordScreen() {
  return (
    <AuthGate>
      <ChangePasswordContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
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
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});
