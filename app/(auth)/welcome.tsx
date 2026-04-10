import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const countryCode = useAuthStore((state) => state.countryCode);
  const setCountry = useAuthStore((state) => state.setCountry);

  function validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function handleContinue() {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError(undefined);
    router.push({ pathname: '/(auth)/register', params: { email: email.trim() } });
  }

  function handleGoogleOAuth() {
    // Navigates to google-callback which handles the full OAuth flow
    Alert.alert('Google Sign In', 'Google OAuth flow not yet configured in app.json');
  }

  function handleGuestBrowse() {
    router.replace('/(tabs)/search');
  }

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
          {/* Header row */}
          <View className="flex-row justify-end px-4 pt-4">
            <CountrySelector
              selectedCode={countryCode}
              onSelect={(code) => void setCountry(code)}
            />
          </View>

          {/* Branding */}
          <View className="flex-1 px-6 pt-10 pb-8">
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-blue-600 mb-2">RealEstatePro</Text>
              <Text className="text-base text-gray-500 text-center">
                Find your perfect home
              </Text>
            </View>

            {/* Email input */}
            <Input
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
              }}
              error={emailError}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleContinue}
            />

            {/* Primary CTA */}
            <Button onPress={handleContinue} size="lg" className="w-full mb-3">
              Continue
            </Button>

            {/* Google OAuth */}
            <Button
              variant="secondary"
              onPress={handleGoogleOAuth}
              size="lg"
              className="w-full mb-6"
            >
              Continue with Google
            </Button>

            {/* Guest browse */}
            <View className="items-center">
              <Button variant="ghost" onPress={handleGuestBrowse}>
                Browse as guest
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
