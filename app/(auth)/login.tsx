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
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { colors, fontWeight, radius } from '@/constants/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail]       = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | undefined>();
  const [countdown, setCountdown] = useState(0);
  const login = useLogin();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleSignIn() {
    if (!email.trim() || !password) { setError(t('login.errors.emailAndPassword')); return; }
    setError(undefined);
    login.mutate({ email: email.trim(), password }, {
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 400 || status === 401) setError(t('login.errors.incorrectCredentials'));
        else if (status === 429) setCountdown(60);
        else setError(t('common.errors.generic'));
      },
    });
  }

  const rateLimited = countdown > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.heading}>{t('login.title')}</Text>

            <Input
              label={t('login.email.label')}
              value={email}
              onChangeText={(v) => { setEmail(v); if (error) setError(undefined); }}
              placeholder={t('login.email.placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <View style={styles.pwWrap}>
              <Input
                label={t('login.password.label')}
                value={password}
                onChangeText={(v) => { setPassword(v); if (error) setError(undefined); }}
                error={error}
                secureTextEntry={!showPw}
                placeholder={t('login.password.placeholder')}
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity
                style={styles.showPw}
                onPress={() => setShowPw((v) => !v)}
                accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw
                  ? <EyeOff size={20} color={colors.textTertiary} />
                  : <Eye size={20} color={colors.textTertiary} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotWrap} onPress={() => Alert.alert('Forgot Password', 'Password reset is not yet available. Please contact support.')}>
              <Text style={styles.forgotText}>{t('login.password.forgot')}</Text>
            </TouchableOpacity>

            {rateLimited && (
              <View style={styles.rateBanner}>
                <Text style={styles.rateText}>{t('common.errors.rateLimited', { countdown })}</Text>
              </View>
            )}

            <Button onPress={handleSignIn} size="lg" style={styles.btnFull} loading={login.isPending} disabled={rateLimited || login.isPending}>
              {t('common.signIn')}
            </Button>
            <Button variant="secondary" onPress={() => Alert.alert('Google Sign In', 'Google OAuth flow not yet configured')} size="lg" style={[styles.btnFull, styles.btnMt]}>
              {t('auth.googleSignIn')}
            </Button>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>{t('login.register.prompt')}</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/welcome')}>
                <Text style={styles.registerLink}>{t('login.register.link')}</Text>
              </TouchableOpacity>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 28 },
  pwWrap:  { position: 'relative' },
  showPw:  { position: 'absolute', right: 14, top: 36, padding: 4 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, color: colors.primary },
  rateBanner: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: colors.warningBg, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  rateText:   { color: colors.warningText, fontSize: 13, fontWeight: fontWeight.medium },
  btnFull: { width: '100%' },
  btnMt:   { marginTop: 12 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registerPrompt: { fontSize: 15, color: colors.textSecondary },
  registerLink:   { fontSize: 15, color: colors.primary, fontWeight: fontWeight.semibold },
});
