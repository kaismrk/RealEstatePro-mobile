import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const login = useLogin();

  // Countdown timer for rate-limit
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setTimeout(() => setRateLimitCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError(undefined);

    login.mutate(
      { email: email.trim(), password },
      {
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { status?: number; data?: { detail?: string } };
          };
          const status = axiosErr.response?.status;

          if (status === 400 || status === 401) {
            setError('Incorrect email or password');
          } else if (status === 429) {
            setRateLimitCountdown(60);
          } else {
            setError('Something went wrong. Please try again.');
          }
        },
      }
    );
  }

  function handleForgotPassword() {
    Alert.alert(
      'Forgot Password',
      'Password reset is not yet available. Please contact support.',
      [{ text: 'OK' }]
    );
  }

  function handleGoogleOAuth() {
    Alert.alert('Google Sign In', 'Google OAuth flow not yet configured in app.json');
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
            <Text className="text-2xl font-bold text-gray-900 mb-8">Welcome back</Text>

            <Input
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(undefined);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Password with show/hide */}
            <View className="relative">
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(undefined);
                }}
                error={error}
                secureTextEntry={!showPassword}
                placeholder="Your password"
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
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

            {/* Forgot password */}
            <TouchableOpacity
              className="items-end mb-6"
              onPress={handleForgotPassword}
              accessibilityLabel="Forgot password"
            >
              <Text className="text-sm text-blue-600">Forgot password?</Text>
            </TouchableOpacity>

            {/* Rate limit banner */}
            {isRateLimited && (
              <View className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-orange-700 text-sm font-medium">
                  Too many attempts. Please wait {rateLimitCountdown}s before trying again.
                </Text>
              </View>
            )}

            <Button
              onPress={handleSignIn}
              size="lg"
              className="w-full mb-3"
              loading={login.isPending}
              disabled={isRateLimited || login.isPending}
            >
              Sign In
            </Button>

            <Button
              variant="secondary"
              onPress={handleGoogleOAuth}
              size="lg"
              className="w-full mb-8"
            >
              Continue with Google
            </Button>

            {/* Register link */}
            <View className="flex-row justify-center">
              <Text className="text-base text-gray-600">Don&apos;t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/welcome')}
                accessibilityLabel="Register"
              >
                <Text className="text-base text-blue-600 font-semibold">Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
