import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth.store';

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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Create a password</Text>
            <Text className="text-base text-gray-500 mb-8">
              Choose a strong password to protect your account.
            </Text>

            {/* Password field with show/hide toggle */}
            <View className="relative">
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
                className="absolute right-3 top-9"
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text className="text-sm text-blue-600 font-semibold">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Real-time strength meter */}
            {password.length > 0 && <PasswordStrengthMeter password={password} />}

            {/* Rate limit banner */}
            {isRateLimited && (
              <View className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-orange-700 text-sm font-medium">
                  Too many attempts. Please wait {rateLimitCountdown}s before trying again.
                </Text>
              </View>
            )}

            <Button
              onPress={handleCreateAccount}
              size="lg"
              className="w-full"
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
