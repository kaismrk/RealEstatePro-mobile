import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Create your account</Text>

            {/* Email display */}
            <View style={styles.emailRow}>
              <Text style={styles.emailText}>{email}</Text>
              <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Change email">
                <Text style={styles.changeLink}>Change</Text>
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

            <Button onPress={handleNext} size="lg" style={styles.nextButton}>
              Next
            </Button>

            {/* Sign in link */}
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() =>
                  router.replace({ pathname: '/(auth)/login', params: { email } })
                }
                accessibilityLabel="Sign in"
              >
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex1: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  emailText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginRight: 8,
  },
  changeLink: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  nextButton: {
    width: '100%',
    marginBottom: 24,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
