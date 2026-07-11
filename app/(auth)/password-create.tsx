import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

export default function PasswordCreateScreen() {
  const { t } = useTranslation();
  const { email, first_name, last_name, phone_e164 } = useLocalSearchParams<{
    email: string;
    first_name: string;
    last_name: string;
    phone_e164?: string;
  }>();
  const countryCode = useAuthStore((state) => state.countryCode);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const register = useRegister();

  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setTimeout(() => setRateLimitCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  function handleCreateAccount() {
    setFieldError(undefined);
    setConfirmError(undefined);

    if (!password) {
      setFieldError(t('passwordCreate.errors.passwordRequired'));
      return;
    }
    if (!confirmPassword) {
      setConfirmError(t('passwordCreate.errors.confirmRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(t('passwordCreate.errors.mismatch'));
      return;
    }

    register.mutate(
      {
        email,
        password,
        first_name,
        last_name,
        country_code: countryCode,
        phone_e164: phone_e164 || undefined,
      },
      {
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: {
              status?: number;
              data?: { detail?: string | Array<{ msg: string }> };
            };
          };
          const status = axiosErr.response?.status;

          if (status === 422) {
            const detail = axiosErr.response?.data?.detail;
            if (Array.isArray(detail) && detail.length > 0) {
              setFieldError(detail[0].msg);
            } else {
              setFieldError('Invalid data. Please check your inputs.');
            }
          } else if (status === 429) {
            setRateLimitCountdown(60);
          } else {
            setFieldError(t('common.errors.generic'));
          }
        },
      }
    );
  }

  const isRateLimited = rateLimitCountdown > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Text style={styles.title}>{t('passwordCreate.title')}</Text>
            <Text style={styles.subtitle}>{t('passwordCreate.subtitle')}</Text>

            {/* Password field with show/hide toggle */}
            <View style={styles.passwordWrapper}>
              <Input
                label={t('passwordCreate.password.label')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldError) setFieldError(undefined);
                  if (confirmError && text === confirmPassword) setConfirmError(undefined);
                }}
                error={fieldError}
                secureTextEntry={!showPassword}
                placeholder={t('passwordCreate.password.placeholder')}
                returnKeyType="next"
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff size={20} color={colors.textTertiary} />
                  : <Eye size={20} color={colors.textTertiary} />}
              </TouchableOpacity>
            </View>

            {/* Real-time strength meter */}
            {password.length > 0 && <PasswordStrengthMeter password={password} />}

            {/* Confirm password field */}
            <View style={styles.passwordWrapper}>
              <Input
                label={t('passwordCreate.confirmPassword.label')}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmError && text === password) setConfirmError(undefined);
                }}
                error={confirmError}
                secureTextEntry={!showConfirm}
                placeholder={t('passwordCreate.confirmPassword.placeholder')}
                returnKeyType="go"
                onSubmitEditing={handleCreateAccount}
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowConfirm((v) => !v)}
                accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm
                  ? <EyeOff size={20} color={colors.textTertiary} />
                  : <Eye size={20} color={colors.textTertiary} />}
              </TouchableOpacity>
            </View>

            {/* Rate limit banner */}
            {isRateLimited && (
              <View style={styles.rateLimitBanner}>
                <Text style={styles.rateLimitText}>
                  {t('common.errors.rateLimited', { countdown: rateLimitCountdown })}
                </Text>
              </View>
            )}

            <Button
              onPress={handleCreateAccount}
              size="lg"
              style={styles.createBtn}
              loading={register.isPending}
              disabled={
                isRateLimited ||
                register.isPending ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword
              }
            >
              {t('passwordCreate.submit')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex1: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    marginBottom: 32,
  },
  passwordWrapper: {
    position: 'relative',
  },
  showHideBtn: {
    position: 'absolute',
    right: 12,
    top: 36,
  },
  rateLimitBanner: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  rateLimitText: {
    color: colors.warningText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  createBtn: {
    width: '100%',
  },
});
