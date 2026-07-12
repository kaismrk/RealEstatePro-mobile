import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGoogleLogin } from '@/hooks/useAuth';
import { colors, fontSize } from '@/constants/theme';

export default function GoogleCallbackScreen() {
  const { id_token, error: oauthError } = useLocalSearchParams<{
    id_token?: string;
    error?: string;
  }>();

  const googleLogin = useGoogleLogin();

  useEffect(() => {
    if (oauthError) {
      // OAuth was denied or failed — go back to welcome
      router.replace('/(auth)/welcome');
      return;
    }

    if (id_token) {
      googleLogin.mutate(
        { id_token },
        {
          onError: () => {
            router.replace('/(auth)/welcome');
          },
        }
      );
    } else {
      // No token and no error — something went wrong
      router.replace('/(auth)/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (googleLogin.isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Google sign in failed. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    marginTop: 16,
  },
});
