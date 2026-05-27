import { useState, useEffect } from 'react';
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
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUser';

function EditProfileContent() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});

  // Populate form when user data arrives
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setEmail(user.email);
    }
  }, [user]);

  function validate(): boolean {
    const newErrors: { email?: string } = {};
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: { first_name?: string; last_name?: string; email?: string } = {};
    if (firstName.trim() !== (user?.first_name ?? '')) {
      payload.first_name = firstName.trim() || undefined;
    }
    if (lastName.trim() !== (user?.last_name ?? '')) {
      payload.last_name = lastName.trim() || undefined;
    }
    if (email.trim() && email.trim() !== user?.email) {
      payload.email = email.trim();
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        Alert.alert('Success', 'Profile updated successfully.');
        router.back();
      },
      onError: (err) => {
        Alert.alert('Error', err.message ?? 'Failed to update profile. Please try again.');
      },
    });
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
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
            <Text className="text-primary-500 text-base">‹ Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1">Edit Profile</Text>
        </View>

        <View className="px-4 pt-6">
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCorrect={false}
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCorrect={false}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors({});
            }}
            error={errors.email}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Country read-only (FINDING-011: not editable) */}
          {user?.country_code ? (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Country</Text>
              <View className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                <Text className="text-base text-gray-500">{user.country_code}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                Country can only be changed in App Settings.
              </Text>
            </View>
          ) : null}

          <Button
            onPress={handleSave}
            loading={updateProfile.isPending}
            size="lg"
            className="mt-2"
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EditProfileScreen() {
  return (
    <AuthGate>
      <EditProfileContent />
    </AuthGate>
  );
}
