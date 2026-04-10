import { View, Text, FlatList, type ListRenderItemInfo } from 'react-native';
import { useNearby } from '@/hooks/useNearby';
import { PropertyCard } from './PropertyCard';
import type { PropertySchema } from '@/lib/types/property';

interface NearbyHomesRowProps {
  lat: number;
  lng: number;
  excludeId: number;
}

export function NearbyHomesRow({ lat, lng, excludeId }: NearbyHomesRowProps) {
  const { data, isLoading } = useNearby(lat, lng, 5);

  const nearby = data?.items.filter((p) => p.id !== excludeId) ?? [];

  if (isLoading) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-3 px-4">Nearby Homes</Text>
        <View className="h-56 bg-gray-100 rounded-2xl mx-4 items-center justify-center">
          <Text className="text-gray-400">Loading...</Text>
        </View>
      </View>
    );
  }

  if (nearby.length === 0) return null;

  function renderItem({ item }: ListRenderItemInfo<PropertySchema>) {
    return (
      <View className="w-72">
        <PropertyCard property={item} compact />
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3 px-4">Nearby Homes</Text>
      <FlatList<PropertySchema>
        data={nearby}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}
