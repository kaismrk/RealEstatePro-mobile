import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { AgencyResponse } from '@/hooks/useAgencies';

interface AgencyCardProps {
  agency: AgencyResponse;
  onPress?: () => void;
}

export function AgencyCard({ agency, onPress }: AgencyCardProps) {
  const snippet =
    agency.description && agency.description.length > 80
      ? agency.description.slice(0, 80) + '…'
      : (agency.description ?? '');

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-100 p-4 mb-3 flex-row items-center shadow-sm"
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`View agency ${agency.name}`}
    >
      {agency.logo_url ? (
        <Image
          source={{ uri: agency.logo_url }}
          className="w-14 h-14 rounded-xl mr-3"
          resizeMode="cover"
          accessibilityLabel={`${agency.name} logo`}
        />
      ) : (
        <View className="w-14 h-14 rounded-xl bg-blue-100 items-center justify-center mr-3">
          <Text className="text-2xl">🏢</Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {agency.name}
        </Text>
        {snippet.length > 0 && (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
            {snippet}
          </Text>
        )}
        <Text className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
          {agency.country_code}
        </Text>
      </View>

      <Text className="text-gray-400 text-base ml-2">›</Text>
    </TouchableOpacity>
  );
}
