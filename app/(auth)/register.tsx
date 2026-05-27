import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | undefined>();
  const [lastNameError, setLastNameError] = useState<string | undefined>();

  function handleNext() {
    let valid = true;
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      valid = false;
    } else {
      setFirstNameError(undefined);
    }
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      valid = false;
    } else {
      setLastNameError(undefined);
    }
    if (!valid) return;

    router.push({
      pathname: '/(auth)/password-create',
      params: {
        email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Create your account</Text>

            {/* Email display */}
            <View className="flex-row items-center mb-6">
              <Text className="text-base text-gray-600 mr-2">{email}</Text>
              <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Change email">
                <Text className="text-base text-primary-500 font-semibold">Change</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="First name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (firstNameError) setFirstNameError(undefined);
              }}
              error={firstNameError}
              placeholder="Jane"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Input
              label="Last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (lastNameError) setLastNameError(undefined);
              }}
              error={lastNameError}
              placeholder="Smith"
              autoCapitalize="words"
              returnKeyType="go"
              onSubmitEditing={handleNext}
            />

            <Button onPress={handleNext} size="lg" className="w-full mb-6">
              Next
            </Button>

            {/* Sign in link */}
            <View className="flex-row justify-center">
              <Text className="text-base text-gray-600">Already have an account? </Text>
              <TouchableOpacity
                onPress={() =>
                  router.replace({ pathname: '/(auth)/login', params: { email } })
                }
                accessibilityLabel="Sign in"
              >
                <Text className="text-base text-primary-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
