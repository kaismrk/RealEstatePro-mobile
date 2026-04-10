import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useCreateAgency } from '@/hooks/useAgencies';
import { useAuthStore } from '@/lib/stores/auth.store';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  required,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: 'default' | 'url';
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        className={`bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 ${
          multiline ? 'min-h-24' : ''
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function CreateAgencyScreen() {
  const countryCode = useAuthStore((s) => s.countryCode);
  const create = useCreateAgency();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation', 'Agency name is required.');
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (website.trim()) socialLinks.website = website.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (twitter.trim()) socialLinks.twitter = twitter.trim();

    create.mutate(
      {
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        country_code: countryCode,
      },
      {
        onSuccess: () => {
          router.replace('/agency/manage');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Failed to create agency. Please try again.';
          Alert.alert('Error', msg);
        },
      }
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="px-4 pt-14 pb-3 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3"
        >
          <Text className="text-blue-600 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Create Agency</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Field
          label="Agency Name"
          value={name}
          onChangeText={setName}
          placeholder="Your Real Estate Agency"
          required
        />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://example.com/logo.png"
          keyboardType="url"
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell potential clients about your agency…"
          multiline
        />

        <Text className="text-sm font-semibold text-gray-700 mb-3 mt-2">Social Links</Text>
        <Field
          label="Website"
          value={website}
          onChangeText={setWebsite}
          placeholder="https://your-website.com"
          keyboardType="url"
        />
        <Field
          label="Facebook"
          value={facebook}
          onChangeText={setFacebook}
          placeholder="https://facebook.com/yourpage"
          keyboardType="url"
        />
        <Field
          label="Instagram"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="https://instagram.com/youraccount"
          keyboardType="url"
        />
        <Field
          label="Twitter / X"
          value={twitter}
          onChangeText={setTwitter}
          placeholder="https://x.com/youraccount"
          keyboardType="url"
        />

        {/* Submit */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-4 mb-8 ${
            create.isPending ? 'bg-blue-300' : 'bg-blue-600'
          }`}
          onPress={handleSubmit}
          disabled={create.isPending}
          accessibilityRole="button"
          accessibilityLabel="Create agency"
        >
          {create.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Agency</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
