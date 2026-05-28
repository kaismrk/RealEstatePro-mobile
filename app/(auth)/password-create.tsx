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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

export default function PasswordCreateScreen() {
  const { email, first_name, last_name } = useLocalSearchParams<{
    email: string;
    first_name: string;
    last_name: string;
  }>();
  const countryCode = useAuthStore((state) => state.countryCode);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const register = useRegister();

  // Countdown timer for rate-limit
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setTimeout(() => setRateLimitCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  function handleCreateAccount() {
    if (!password) {
      setFieldError('Password is required');
      return;
    }
    setFieldError(undefined);

    register.mutate(
      {
        email,
        password,
        first_name,
        last_name,
        country_code: countryCode,
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
            // Start 60-second countdown
            setRateLimitCountdown(60);
          } else {
            setFieldError('Something went wrong. Please try again.');
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
            <Text style={styles.title}>Create a password</Text>
            <Text style={styles.subtitle}>
              Choose a strong password to protect your account.
            </Text>

            {/* Password field with show/hide toggle */}
            <View style={styles.passwordWrapper}>
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldError) setFieldError(undefined);
                }}
                error={fieldError}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                returnKeyType="go"
                onSubmitEditing={handleCreateAccount}
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.showHideText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Real-time strength meter */}
            {password.length > 0 && <PasswordStrengthMeter password={password} />}

            {/* Rate limit banner */}
            {isRateLimited && (
              <View style={styles.rateLimitBanner}>
                <Text style={styles.rateLimitText}>
                  Too many attempts. Please wait {rateLimitCountdown}s before trying again.
                </Text>
              </View>
            )}

            <Button
              onPress={handleCreateAccount}
              size="lg"
              style={styles.createBtn}
              loading={register.isPending}
              disabled={isRateLimited || register.isPending}
            >
              Create Account
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
  showHideText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
    color: '#92400e',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  createBtn: {
    width: '100%',
  },
});
