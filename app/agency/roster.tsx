/**
 * Agent roster screen — lists agents linked to the owner's agency.
 *
 * BACKEND GAP: There is no GET /agencies/{id}/agents endpoint.
 * The Agent model has an `agency_id` field, but no dedicated roster endpoint exists.
 * This screen currently shows a "Coming Soon" state until the backend exposes
 * GET /agencies/{id}/agents or GET /agents/?agency_id={id}.
 *
 * When available, replace the placeholder content with the fetched roster.
 */

import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAgencies } from '@/hooks/useAgencies';
import { useCurrentUser } from '@/hooks/useUser';

export default function AgentRosterScreen() {
  const { data: user } = useCurrentUser();
  const { data: agencyList, isLoading } = useAgencies();
  const ownedAgency = agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-3 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3"
        >
          <Text className="text-primary-500 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">
          {ownedAgency ? `${ownedAgency.name} — Agents` : 'Agent Roster'}
        </Text>
      </View>

      {/* Placeholder — backend endpoint not yet available */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-5xl mb-4">👥</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2">Agent Roster</Text>
        <Text className="text-gray-500 text-center mb-4">
          Agent listing for agencies is coming soon. The backend does not yet expose a
          GET /agencies/{'{id}'}/agents endpoint.
        </Text>
        <Text className="text-xs text-gray-400 text-center">
          Agents can link themselves to your agency by setting their agency_id in their agent profile.
        </Text>
      </View>
    </View>
  );
}
