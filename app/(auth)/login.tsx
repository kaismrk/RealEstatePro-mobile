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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { colors, fontWeight, radius } from '@/constants/theme';

export default function LoginScreen() {
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail]       = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | undefined>();
  const [countdown, setCountdown] = useState(0);
  const login = useLogin();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleSignIn() {
    if (!email.trim() || !password) { setError('Please enter your email and password'); return; }
    setError(undefined);
    login.mutate({ email: email.trim(), password }, {
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 400 || status === 401) setError('Incorrect email or password');
        else if (status === 429) setCountdown(60);
        else setError('Something went wrong. Please try again.');
      },
    });
  }

  const rateLimited = countdown > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Back">
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Welcome back</Text>

            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (error) setError(undefined); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <View style={styles.pwWrap}>
              <Input
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); if (error) setError(undefined); }}
                error={error}
                secureTextEntry={!showPw}
                placeholder="Your password"
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity style={styles.showPw} onPress={() => setShowPw((v) => !v)}>
                <Text style={styles.showPwText}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotWrap} onPress={() => Alert.alert('Forgot Password', 'Password reset is not yet available. Please contact support.')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {rateLimited && (
              <View style={styles.rateBanner}>
                <Text style={styles.rateText}>Too many attempts. Please wait {countdown}s before trying again.</Text>
              </View>
            )}

            <Button onPress={handleSignIn} size="lg" style={styles.btnFull} loading={login.isPending} disabled={rateLimited || login.isPending}>
              Sign In
            </Button>
            <Button variant="secondary" onPress={() => Alert.alert('Google Sign In', 'Google OAuth flow not yet configured')} size="lg" style={[styles.btnFull, styles.btnMt]}>
              Continue with Google
            </Button>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/welcome')}>
                <Text style={styles.registerLink}>Register</Text>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  back:    { marginBottom: 16 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: fontWeight.medium },
  heading: { fontSize: 26, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 28 },
  pwWrap:  { position: 'relative' },
  showPw:  { position: 'absolute', right: 14, top: 38 },
  showPwText: { fontSize: 13, color: colors.primary, fontWeight: fontWeight.semibold },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, color: colors.primary },
  rateBanner: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#fed7aa', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  rateText:   { color: '#9a3412', fontSize: 13, fontWeight: fontWeight.medium },
  btnFull: { width: '100%' },
  btnMt:   { marginTop: 12 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registerPrompt: { fontSize: 15, color: colors.textSecondary },
  registerLink:   { fontSize: 15, color: colors.primary, fontWeight: fontWeight.semibold },
});
