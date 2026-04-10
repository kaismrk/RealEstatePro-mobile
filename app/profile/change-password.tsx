import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { AuthGate } from '@/components/auth/AuthGate';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useChangePassword } from '@/hooks/useUser';

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
          // onSuccess in hook handles clearAuth + router.replace — no extra action needed here
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
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-blue-600 text-base">‹ Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1">Change Password</Text>
        </View>

        <View className="px-4 pt-6">
          <Text className="text-sm text-gray-500 mb-6">
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
            className="mt-2"
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
