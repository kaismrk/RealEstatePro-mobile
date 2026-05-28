import { View, Text, FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useNearby } from '@/hooks/useNearby';
import { PropertyCard } from './PropertyCard';
import type { PropertySchema } from '@/lib/types/property';
import { colors, radius, fontWeight } from '@/constants/theme';

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
      <View style={styles.container}>
        <Text style={styles.heading}>Nearby Homes</Text>
        <View style={styles.loadingPlaceholder}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (nearby.length === 0) return null;

  function renderItem({ item }: ListRenderItemInfo<PropertySchema>) {
    return (
      <View style={styles.card}>
        <PropertyCard property={item} compact />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nearby Homes</Text>
      <FlatList<PropertySchema>
        data={nearby}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  loadingPlaceholder: {
    height: 224,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.xl2,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textTertiary,
  },
  card: {
    width: 288,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
