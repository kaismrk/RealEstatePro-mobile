import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { useAuthStore } from '@/lib/stores/auth.store';
import { colors, spacing, fontWeight, radius } from '@/constants/theme';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const countryCode = useAuthStore((state) => state.countryCode);
  const setCountry = useAuthStore((state) => state.setCountry);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleContinue() {
    if (!email.trim()) { setEmailError('Please enter your email address'); return; }
    if (!validateEmail(email.trim())) { setEmailError('Please enter a valid email address'); return; }
    setEmailError(undefined);
    router.push({ pathname: '/(auth)/register', params: { email: email.trim() } });
  }

  function handleGoogleOAuth() {
    Alert.alert('Google Sign In', 'Google OAuth flow not yet configured in app.json');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <CountrySelector
              selectedCode={countryCode}
              onSelect={(code) => void setCountry(code)}
            />
          </View>

          {/* Brand block */}
          <View style={styles.brand}>
            {/* Logo mark: violet gradient box with "H" */}
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>H</Text>
            </View>
            <Text style={styles.logoWordmark}>homy</Text>
            <Text style={styles.tagline}>Find your perfect home.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(undefined); }}
              error={emailError}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleContinue}
            />

            <Button onPress={handleContinue} size="lg" style={styles.btnFull}>
              Continue
            </Button>

            <Button
              variant="secondary"
              onPress={handleGoogleOAuth}
              size="lg"
              style={[styles.btnFull, styles.btnMt]}
            >
              Continue with Google
            </Button>

            <View style={styles.guestWrap}>
              <Button variant="ghost" onPress={() => router.replace('/(tabs)/search')}>
                Browse as guest
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface },
  flex:    { flex: 1 },
  scroll:  { flexGrow: 1 },
  topBar:  { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },

  brand: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: fontWeight.extrabold,
    color: '#fff',
    letterSpacing: -1,
  },
  logoWordmark: {
    fontSize: 32,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  btnFull: { width: '100%' },
  btnMt:   { marginTop: 12 },
  guestWrap: { alignItems: 'center', marginTop: 20 },
});
