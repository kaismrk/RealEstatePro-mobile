/**
 * Public agency profile screen.
 *
 * BACKEND GAP: GET /properties/ does not currently support an `agency_id` filter.
 * Agency listings section is omitted until the backend exposes that filter param.
 *
 * BACKEND GAP: No endpoint to list agents of an agency. The AgentProfile model
 * has an `agency_id` field, but there is no GET /agencies/{id}/agents endpoint.
 * Agent roster is shown via the dedicated /agency/roster route (owner only).
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAgency } from '@/hooks/useAgencies';
import { AgencyHeader } from '@/components/agency/AgencyHeader';

export default function AgencyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id ? parseInt(id, 10) : null;
  const { data: agency, isLoading, isError } = useAgency(agencyId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError || !agency) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl mb-4">🏢</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2">Agency not found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This agency may no longer be available.
        </Text>
        <TouchableOpacity
          className="bg-primary-500 rounded-xl px-6 py-3"
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-white text-base">‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Agency header: logo, name, description, social links */}
        <AgencyHeader agency={agency} />

        {/* Divider */}
        <View className="h-2 bg-gray-100" />

        {/* Info section */}
        <View className="bg-white px-4 py-5">
          <Text className="text-base font-semibold text-gray-900 mb-3">About</Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-500 text-sm w-28">Country</Text>
            <Text className="text-gray-900 text-sm font-medium">{agency.country_code}</Text>
          </View>
          {agency.social_links?.website ? (
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-500 text-sm w-28">Website</Text>
              <Text className="text-primary-500 text-sm">{agency.social_links.website}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm w-28">Member since</Text>
            <Text className="text-gray-900 text-sm">
              {new Date(agency.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Sticky Contact CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3.5 items-center"
          accessibilityRole="button"
          accessibilityLabel="Contact agency"
          onPress={() => {
            // Navigate to first property contact or show info modal
            // Requires property association — left as placeholder
          }}
        >
          <Text className="text-white font-semibold">Contact Agency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
