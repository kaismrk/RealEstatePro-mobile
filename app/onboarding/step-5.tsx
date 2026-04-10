import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUIStore } from '@/lib/stores/ui.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { haptic } from '@/lib/utils/haptics';

const INTENT_LABELS: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent',
  sell: 'Sell',
  browse: 'Just browse',
};

const INTENT_ICONS: Record<string, string> = {
  buy: '\uD83C\uDFE0',
  rent: '\uD83D\uDD11',
  sell: '\uD83D\uDCB0',
  browse: '\uD83D\uDC40',
};

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3.5 border-b border-gray-100">
      <Text className="text-xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-xs font-medium text-gray-500 mb-0.5">{label}</Text>
        <Text className="text-base font-semibold text-gray-900">{value}</Text>
      </View>
    </View>
  );
}

export default function OnboardingStep5() {
  const onboardingDraft = useUIStore((s) => s.onboardingDraft);
  const clearOnboardingDraft = useUIStore((s) => s.clearOnboardingDraft);
  const setFilters = useSearchStore((s) => s.setFilters);
  const accessToken = useAuthStore((s) => s.accessToken);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { create } = useSavedSearches();

  const [saveSearch, setSaveSearch] = useState(!!accessToken);
  const [isSaving, setIsSaving] = useState(false);

  const {
    intent,
    region_label,
    min_price,
    max_price,
    min_bedrooms,
    max_bedrooms,
  } = onboardingDraft;

  function buildPriceLabel() {
    if (!min_price && !max_price) return 'Any budget';
    if (!min_price && max_price) return `Up to ${max_price.toLocaleString()}`;
    if (min_price && !max_price) return `From ${min_price.toLocaleString()}`;
    return `${min_price!.toLocaleString()} – ${max_price!.toLocaleString()}`;
  }

  function buildBedroomLabel() {
    if (min_bedrooms == null && max_bedrooms == null) return 'Any';
    if (min_bedrooms === 0 && max_bedrooms == null) return 'Studio or more';
    if (min_bedrooms != null && max_bedrooms == null) {
      return `${min_bedrooms}+ bedrooms`;
    }
    if (min_bedrooms != null && max_bedrooms != null) {
      return `${min_bedrooms} – ${max_bedrooms} bedrooms`;
    }
    return `Up to ${max_bedrooms} bedrooms`;
  }

  async function handleFinish() {
    // Apply filters to search store
    const filters: Parameters<typeof setFilters>[0] = {};
    if (intent && intent !== 'browse' && intent !== 'sell') {
      filters.listing_type = intent;
    }
    if (onboardingDraft.region_id != null) {
      filters.region_id = onboardingDraft.region_id;
    }
    if (min_price != null) filters.min_price = min_price;
    if (max_price != null) filters.max_price = max_price;
    if (min_bedrooms != null) filters.min_bedrooms = min_bedrooms;
    if (max_bedrooms != null) filters.max_bedrooms = max_bedrooms;

    setFilters(filters);

    if (saveSearch && accessToken) {
      setIsSaving(true);
      try {
        await create.mutateAsync({
          name: region_label
            ? `My search in ${region_label}`
            : `My search (${INTENT_LABELS[intent ?? 'browse'] ?? 'Browse'})`,
          filters: {
            listing_type: intent !== 'browse' && intent !== 'sell' ? intent : undefined,
            region_id: onboardingDraft.region_id,
            min_price,
            max_price,
            min_bedrooms,
            max_bedrooms,
          } as Parameters<typeof create.mutateAsync>[0]['filters'],
          country_code: countryCode,
        });
        void haptic.success();
        Toast.show({ type: 'success', text1: 'Search saved!', text2: 'You will get alerts for new matches.' });
      } catch {
        void haptic.error();
        Toast.show({ type: 'error', text1: 'Could not save search', text2: 'You can save it later from the search screen.' });
      } finally {
        setIsSaving(false);
      }
    }

    clearOnboardingDraft();
    router.replace('/(tabs)/search');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 flex-1">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Your search preferences
          </Text>
          <Text className="text-base text-gray-500 mb-7">
            Here is a summary of what you are looking for.
          </Text>

          {/* Summary cards */}
          <View className="bg-gray-50 rounded-2xl px-4 mb-6 overflow-hidden">
            <SummaryRow
              icon={intent ? INTENT_ICONS[intent] ?? '\uD83C\uDFE0' : '\uD83C\uDFE0'}
              label="Intent"
              value={intent ? INTENT_LABELS[intent] ?? 'Browse' : 'Not set'}
            />
            <SummaryRow
              icon="\uD83D\uDCCD"
              label="Location"
              value={region_label ?? 'Anywhere'}
            />
            <SummaryRow
              icon="\uD83D\uDCB0"
              label="Budget"
              value={buildPriceLabel()}
            />
            <View className="flex-row items-center py-3.5">
              <Text className="text-xl mr-3">{'\uD83D\uDECF\uFE0F'}</Text>
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-500 mb-0.5">Bedrooms</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {buildBedroomLabel()}
                </Text>
              </View>
            </View>
          </View>

          {/* Save search toggle (only for authenticated users) */}
          {accessToken ? (
            <View className="flex-row items-center justify-between bg-blue-50 rounded-2xl px-4 py-4 mb-6">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-gray-900 mb-0.5">
                  Save my search
                </Text>
                <Text className="text-sm text-gray-500">
                  Get notified when new homes match
                </Text>
              </View>
              <Switch
                value={saveSearch}
                onValueChange={setSaveSearch}
                trackColor={{ false: '#D1D5DB', true: '#006AFF' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Save search toggle"
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer: Back / Finish */}
      <View className="px-6 py-4 border-t border-gray-100 flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 py-3.5 bg-gray-100 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Back"
          disabled={isSaving}
        >
          <Text className="text-base font-semibold text-gray-700">{'\u2190'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void handleFinish()}
          className={`flex-1 py-3.5 bg-blue-600 rounded-xl flex-row items-center justify-center gap-x-2 ${isSaving ? 'opacity-60' : ''}`}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Finish onboarding"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : null}
          <Text className="text-base font-semibold text-white">
            {isSaving ? 'Saving…' : 'Find Homes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
