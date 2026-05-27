import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useTopLevelRegions, type Region } from '@/hooks/useRegions';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';

export default function OnboardingStep2() {
  const countryCode = useAuthStore((s) => s.countryCode);
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  const [query, setQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: regionsData, isLoading: regionsLoading } = useTopLevelRegions(countryCode);
  const regions = regionsData?.items ?? [];

  const filtered = query.trim()
    ? regions.filter((r) =>
        r.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : regions;

  function handleSelectRegion(region: Region) {
    void haptic.light();
    setOnboardingDraft({ region_id: region.id, region_label: region.name });
    router.push('/onboarding/step-3');
  }

  function handleSkip() {
    router.push('/onboarding/step-3');
  }

  async function handleUseLocation() {
    setLocationError(null);
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. You can type a city instead.');
        setLocationLoading(false);
        return;
      }
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      // Pre-fill query with country name as a fallback since we don't have reverse geocoding
      // endpoint on our backend; the user can refine from the list
      setQuery(countryCode);
    } catch {
      setLocationError('Could not get your location. Please try typing a city.');
    } finally {
      setLocationLoading(false);
    }
  }

  function renderItem({ item }: ListRenderItemInfo<Region>) {
    return (
      <TouchableOpacity
        onPress={() => handleSelectRegion(item)}
        className="flex-row items-center px-4 py-3.5 border-b border-gray-100 bg-white"
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        <Text className="text-base text-gray-800 flex-1">{item.name}</Text>
        <Text className="text-gray-400">{'\u203A'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Where are you looking?
        </Text>
        <Text className="text-base text-gray-500 mb-5">
          Choose a region to focus your search.
        </Text>

        {/* Search input */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-3">
          <Text className="text-gray-400 mr-2">{'\uD83D\uDD0D'}</Text>
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Type a region or city…"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Text className="text-gray-400 text-lg">{'\u00D7'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Use my location button */}
        <TouchableOpacity
          onPress={() => void handleUseLocation()}
          className="flex-row items-center py-2"
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#5f09fe" />
          ) : (
            <Text className="text-base">{'\uD83D\uDCCD'}</Text>
          )}
          <Text className="text-sm font-semibold text-primary-500 ml-2">
            {locationLoading ? 'Getting location…' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        {locationError ? (
          <Text className="text-sm text-red-500 mt-1">{locationError}</Text>
        ) : null}
      </View>

      {/* Region list */}
      {regionsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5f09fe" />
        </View>
      ) : (
        <FlatList<Region>
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="px-6 py-8 items-center">
              <Text className="text-gray-400 text-base">No regions found</Text>
            </View>
          }
        />
      )}

      {/* Footer: Skip / Back */}
      <View className="px-6 py-4 border-t border-gray-100 flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-base font-semibold text-gray-700">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          className="flex-1 py-3.5 border border-gray-300 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <Text className="text-base font-semibold text-gray-600">Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
