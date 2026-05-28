import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { AuthGate } from '@/components/auth/AuthGate';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useChangePassword } from '@/hooks/useUser';
import { colors, fontWeight, radius } from '@/constants/theme';

// Minimum password policy (matches backend)
function meetsPolicy(pw: string): boolean {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw)
  );
}

function ChangePasswordContent() {
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  function validate(): boolean {
    const errs: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errs.current = 'Please enter your current password';
    }
    if (!newPassword) {
      errs.new = 'Please enter a new password';
    } else if (!meetsPolicy(newPassword)) {
      errs.new = 'Password must be 8+ chars with uppercase, lowercase, and a number';
    }
    if (!confirmPassword) {
      errs.confirm = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errs.confirm = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    changePassword.mutate(
      { password: newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            'Password Changed',
            'Your password has been changed. Please sign in again.',
            [{ text: 'OK' }]
          );
        },
        onError: (err) => {
          const message = err.message ?? 'Failed to change password. Please try again.';
          if (message.toLowerCase().includes('401') || message.toLowerCase().includes('unauthorized')) {
            setErrors({ current: 'Current password is incorrect' });
          } else {
            Alert.alert('Error', message);
          }
        },
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="chevron-left" size={20} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.hint}>
            After changing your password you will be signed out and asked to sign in again.
          </Text>

          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={(t) => {
              setCurrentPassword(t);
              if (errors.current) setErrors((e) => ({ ...e, current: undefined }));
            }}
            error={errors.current}
            placeholder="Your current password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={(t) => {
              setNewPassword(t);
              if (errors.new) setErrors((e) => ({ ...e, new: undefined }));
            }}
            error={errors.new}
            placeholder="New password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {newPassword.length > 0 ? (
            <PasswordStrengthMeter password={newPassword} />
          ) : null}

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
            }}
            error={errors.confirm}
            placeholder="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            onPress={handleSubmit}
            loading={changePassword.isPending}
            size="lg"
            style={styles.submitButton}
          >
            Change Password
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ChangePasswordScreen() {
  return (
    <AuthGate>
      <ChangePasswordContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});
