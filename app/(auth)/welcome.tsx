import { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fontWeight, radius } from '@/constants/theme';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

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
          {/* Brand gradient hero */}
          <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Image
              source={require('@/assets/hovioo-logo-white.png')}
              style={styles.heroLogo}
              resizeMode="contain"
              accessibilityLabel="Hovioo"
            />
          </LinearGradient>

          {/* White card overlapping hero */}
          <View style={styles.card}>
            <Text style={styles.heading}>Find your perfect home</Text>
            <Text style={styles.subtitle}>
              Browse 200,000+ listings across Tunisia. Save favorites, message agents, and book tours — all in one place.
            </Text>

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surfaceMuted },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    height: 150,
    width: 200,
  },

  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl2,
    borderTopRightRadius: radius.xl2,
    marginTop: -16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
    marginBottom: 22,
  },

  form: { gap: 0 },
  btnFull: { width: '100%' },
  btnMt:   { marginTop: 12 },
  guestWrap: { alignItems: 'center', marginTop: 12 },
});
