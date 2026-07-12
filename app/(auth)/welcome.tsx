import { useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { useAppleSignIn } from '@/hooks/useAppleSignIn';
import { colors, fontWeight, radius } from '@/constants/theme';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const google = useGoogleSignIn();
  const apple  = useAppleSignIn();

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleContinue() {
    if (!email.trim()) { setEmailError(t('welcome.errors.required')); return; }
    if (!validateEmail(email.trim())) { setEmailError(t('welcome.errors.invalid')); return; }
    setEmailError(undefined);
    router.push({ pathname: '/(auth)/register', params: { email: email.trim() } });
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
            <Text style={styles.heading}>{t('welcome.title')}</Text>
            <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

            <View style={styles.form}>
              <Input
                label={t('login.email.label')}
                value={email}
                onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(undefined); }}
                error={emailError}
                placeholder={t('login.email.placeholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleContinue}
              />

              <Button onPress={handleContinue} size="lg" style={styles.btnFull}>
                {t('common.continue')}
              </Button>

              {/* Social sign-in — always show Google; show Apple on iOS 13+ only */}
              {google.isAvailable && (
                <Button
                  variant="secondary"
                  onPress={() => void google.signIn()}
                  size="lg"
                  style={[styles.btnFull, styles.btnMt]}
                  loading={google.isLoading}
                  disabled={google.isLoading}
                >
                  {t('auth.social.continueWithGoogle')}
                </Button>
              )}
              {apple.isAvailable && (
                <Button
                  variant="secondary"
                  onPress={() => void apple.signIn()}
                  size="lg"
                  style={[styles.btnFull, styles.btnMt]}
                  loading={apple.isLoading}
                  disabled={apple.isLoading}
                >
                  {t('auth.social.continueWithApple')}
                </Button>
              )}

              {/* Social error banner */}
              {(google.error ?? apple.error) ? (
                <View style={styles.socialErrBanner}>
                  <Text style={styles.socialErrText}>
                    {google.error ?? apple.error}
                  </Text>
                </View>
              ) : null}

              <View style={styles.guestWrap}>
                <Button variant="ghost" onPress={() => router.replace('/(tabs)/search')}>
                  {t('welcome.browseAsGuest')}
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
  socialErrBanner: { backgroundColor: colors.errorBg, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10, marginTop: 12 },
  socialErrText:   { color: colors.error, fontSize: 13 },
});
