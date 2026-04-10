/**
 * Agency management screen — owner can edit or delete their agency.
 *
 * BACKEND GAP: GET /agencies/ does not support an `owner_id` filter, so we fetch
 * all agencies and filter client-side by owner_id matching the current user's id.
 * When the backend adds owner_id filtering, update the queryFn in useAgencies.
 */

import { useState, useEffect } from 'react';
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
import { useAgencies, useUpdateAgency, useDeleteAgency } from '@/hooks/useAgencies';
import { useCurrentUser } from '@/hooks/useUser';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  required?: boolean;
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

export default function ManageAgencyScreen() {
  const { data: user } = useCurrentUser();
  const { data: agencyList, isLoading } = useAgencies();
  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  // Find agency owned by current user
  const ownedAgency =
    agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  // Populate fields when agency loads
  useEffect(() => {
    if (ownedAgency) {
      setName(ownedAgency.name);
      setLogoUrl(ownedAgency.logo_url ?? '');
      setDescription(ownedAgency.description ?? '');
      setWebsite(ownedAgency.social_links?.website ?? '');
      setFacebook(ownedAgency.social_links?.facebook ?? '');
      setInstagram(ownedAgency.social_links?.instagram ?? '');
      setTwitter(ownedAgency.social_links?.twitter ?? '');
    }
  }, [ownedAgency?.id]);

  function handleSave() {
    if (!ownedAgency) return;
    if (!name.trim()) {
      Alert.alert('Validation', 'Agency name is required.');
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (website.trim()) socialLinks.website = website.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (twitter.trim()) socialLinks.twitter = twitter.trim();

    updateAgency.mutate(
      {
        id: ownedAgency.id,
        data: {
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          description: description.trim() || null,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Saved', 'Agency profile updated successfully.');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Failed to save changes. Please try again.';
          Alert.alert('Error', msg);
        },
      }
    );
  }

  function handleDelete() {
    if (!ownedAgency) return;

    Alert.alert(
      'Delete Agency',
      `Are you sure you want to permanently delete "${ownedAgency.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAgency.mutate(ownedAgency.id, {
              onSuccess: () => {
                router.replace('/(tabs)/profile');
              },
              onError: (err: unknown) => {
                const msg =
                  (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Failed to delete agency.';
                Alert.alert('Error', msg);
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!ownedAgency) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-5xl mb-4">🏢</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2">No Agency Yet</Text>
        <Text className="text-gray-500 text-center mb-6">
          You don't own an agency. Create one to start listing properties under your brand.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-6 py-3"
          onPress={() => router.push('/agency/create')}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">Create Agency</Text>
        </TouchableOpacity>
      </View>
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
        <Text className="text-xl font-bold text-gray-900 flex-1">Manage Agency</Text>
        <TouchableOpacity
          onPress={() => router.push(`/agency/${ownedAgency.id}`)}
          accessibilityRole="button"
          accessibilityLabel="View public profile"
        >
          <Text className="text-blue-600 text-sm">View Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Field label="Agency Name" value={name} onChangeText={setName} required />
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

        {/* Save button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-4 ${
            updateAgency.isPending ? 'bg-blue-300' : 'bg-blue-600'
          }`}
          onPress={handleSave}
          disabled={updateAgency.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save agency changes"
        >
          {updateAgency.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Subscription shortcut */}
        <TouchableOpacity
          className="rounded-xl py-4 items-center mt-3 border border-blue-600"
          onPress={() => router.push('/agency/subscription')}
          accessibilityRole="button"
          accessibilityLabel="Manage subscription"
        >
          <Text className="text-blue-600 font-semibold text-base">Manage Subscription</Text>
        </TouchableOpacity>

        {/* Agent roster shortcut */}
        <TouchableOpacity
          className="rounded-xl py-4 items-center mt-3 border border-gray-300"
          onPress={() => router.push('/agency/roster')}
          accessibilityRole="button"
          accessibilityLabel="View agent roster"
        >
          <Text className="text-gray-700 font-semibold text-base">Agent Roster</Text>
        </TouchableOpacity>

        {/* Danger zone */}
        <View className="mt-6 mb-10 border border-red-200 rounded-xl p-4 bg-red-50">
          <Text className="text-sm font-semibold text-red-700 mb-2">Danger Zone</Text>
          <Text className="text-xs text-red-500 mb-3">
            Deleting your agency is permanent and cannot be undone.
          </Text>
          <TouchableOpacity
            className={`rounded-xl py-3 items-center ${
              deleteAgency.isPending ? 'bg-red-300' : 'bg-red-600'
            }`}
            onPress={handleDelete}
            disabled={deleteAgency.isPending}
            accessibilityRole="button"
            accessibilityLabel="Delete agency"
          >
            {deleteAgency.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">Delete Agency</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
