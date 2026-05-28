import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useState } from 'react';
import { colors, radius, fontWeight } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** 'modal' shows a bottom sheet CTA; 'redirect' navigates to welcome screen. Default: 'redirect' */
  trigger?: 'modal' | 'redirect';
}

function SignInModal({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet visible onClose={onClose} snapPoints={['35%']}>
      <View style={styles.modalContent}>
        <Icon name="key" size={32} color={colors.primary} />
        <Text style={styles.modalTitle}>Sign in to continue</Text>
        <Text style={styles.modalSubtitle}>
          Create a free account or sign in to access this feature.
        </Text>
        <TouchableOpacity
          onPress={() => {
            onClose();
            router.push('/(auth)/welcome');
          }}
          style={styles.signInButton}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelText}>Maybe later</Text>
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

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInButtonText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
  cancelText: {
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
});
