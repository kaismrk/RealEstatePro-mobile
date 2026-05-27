import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useState } from 'react';

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** 'modal' shows a bottom sheet CTA; 'redirect' navigates to welcome screen. Default: 'redirect' */
  trigger?: 'modal' | 'redirect';
}

function SignInModal({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet visible onClose={onClose} snapPoints={['35%']}>
      <View className="px-6 pt-4 pb-8 items-center">
        <Text className="text-2xl mb-3">{'\uD83D\uDD12'}</Text>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">
          Sign in to continue
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Create a free account or sign in to access this feature.
        </Text>
        <TouchableOpacity
          onPress={() => {
            onClose();
            router.push('/(auth)/welcome');
          }}
          className="w-full bg-primary-500 py-4 rounded-xl items-center mb-3"
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text className="text-white font-semibold text-base">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text className="text-gray-500 font-medium">Maybe later</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

export function AuthGate({ children, fallback, trigger = 'redirect' }: AuthGateProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [modalVisible, setModalVisible] = useState(true);

  if (!accessToken) {
    if (fallback !== undefined) {
      return fallback;
    }

    if (trigger === 'modal') {
      return (
        <SignInModal onClose={() => setModalVisible(false)} />
      );
    }

    // Default redirect mode
    router.replace('/(auth)/welcome');
    return null;
  }

  return children;
}
