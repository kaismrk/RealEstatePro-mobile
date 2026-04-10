import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useAgent } from '@/hooks/useAgent';
import { useAgency } from '@/hooks/useAgency';

interface AgentCardProps {
  agentId: number;
  agencyId?: number | null;
  propertyId: number | string;
}

export function AgentCard({ agentId, agencyId, propertyId }: AgentCardProps) {
  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const { data: agency } = useAgency(agencyId);

  if (agentLoading) {
    return (
      <View className="mb-6 bg-gray-50 rounded-2xl p-4">
        <View className="h-4 w-32 bg-gray-200 rounded mb-2" />
        <View className="h-4 w-24 bg-gray-200 rounded" />
      </View>
    );
  }

  if (!agent) return null;

  function handleContact() {
    router.push(`/property/${propertyId}/contact`);
  }

  return (
    <View className="mb-6 bg-gray-50 rounded-2xl p-4">
      <Text className="text-lg font-bold text-gray-900 mb-3">Listed by</Text>

      <View className="flex-row items-center mb-3">
        {/* Avatar placeholder */}
        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
          <Text className="text-blue-600 font-bold text-lg">
            {String(agentId).charAt(0)}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-gray-900">Agent #{agentId}</Text>
          {agent.phone && (
            <Text className="text-sm text-gray-500">{agent.phone}</Text>
          )}
        </View>
      </View>

      {/* Agency info */}
      {agency && (
        <View className="flex-row items-center mb-3 border-t border-gray-200 pt-3">
          {agency.logo_url ? (
            <Image
              source={{ uri: agency.logo_url }}
              className="w-8 h-8 rounded mr-2"
              resizeMode="contain"
              accessibilityLabel={`${agency.name} logo`}
            />
          ) : (
            <View className="w-8 h-8 rounded bg-gray-200 mr-2 items-center justify-center">
              <Text className="text-xs text-gray-500">A</Text>
            </View>
          )}
          <Text className="text-sm text-gray-700 font-medium">{agency.name}</Text>
        </View>
      )}

      {agent.bio && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
          {agent.bio}
        </Text>
      )}

      <TouchableOpacity
        className="bg-blue-600 rounded-xl py-3 items-center"
        onPress={handleContact}
        accessibilityRole="button"
        accessibilityLabel="Contact agent"
      >
        <Text className="text-white font-semibold">Contact Agent</Text>
      </TouchableOpacity>
    </View>
  );
}
