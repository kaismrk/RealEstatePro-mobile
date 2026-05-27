import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGoogleLogin } from '@/hooks/useAuth';

export default function GoogleCallbackScreen() {
  const { google_token, error: oauthError } = useLocalSearchParams<{
    google_token?: string;
    error?: string;
  }>();

  const googleLogin = useGoogleLogin();

  useEffect(() => {
    if (oauthError) {
      // OAuth was denied or failed — go back to welcome
      router.replace('/(auth)/welcome');
      return;
    }

    if (google_token) {
      googleLogin.mutate(
        { google_token },
        {
          onError: () => {
            router.replace('/(auth)/welcome');
          },
        }
      );
    } else {
      // No token and no error — something went wrong
      router.replace('/(auth)/welcome');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (googleLogin.isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-base text-red-600 text-center mb-4">
          Google sign in failed. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#5f09fe" />
      <Text className="text-base text-gray-500 mt-4">Signing you in...</Text>
    </View>
  );
}
