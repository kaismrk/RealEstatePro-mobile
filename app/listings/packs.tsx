import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useListingPacks, type ListingPackResponse } from '@/hooks/useListingPacks';
import { usePurchasePack } from '@/hooks/usePurchasePack';
import { useListingQuota } from '@/hooks/useUser';
import { Button } from '@/components/ui/Button';

export default function PacksScreen() {
  const { data, isLoading, isError, refetch } = useListingPacks();
  const { data: quota } = useListingQuota();
  const purchasePack = usePurchasePack();

  function handlePurchase(pack: ListingPackResponse) {
    Alert.alert(
      'Purchase Pack',
      `Buy "${pack.name}" for ${pack.price.toFixed(2)} TND and receive ${pack.listing_count} listing slot${pack.listing_count !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            purchasePack.mutate(pack.id, {
              onSuccess: (quota) => {
                Alert.alert(
                  'Success',
                  `${pack.listing_count} listing slot${pack.listing_count !== 1 ? 's' : ''} added to your quota! You now have ${quota.paid_remaining} paid slots.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              },
              onError: (err) => {
                Alert.alert('Error', err.message ?? 'Purchase failed. Please try again.');
              },
            });
          },
        },
      ]
    );
  }

  function renderItem({ item }: ListRenderItemInfo<ListingPackResponse>) {
    return (
      <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {item.listing_count} listing slot{item.listing_count !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary-500 ml-3">
            {item.price.toFixed(2)} TND
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handlePurchase(item)}
          disabled={purchasePack.isPending}
          className="bg-primary-500 rounded-xl py-3 items-center mt-2"
          accessibilityRole="button"
          accessibilityLabel={`Purchase ${item.name}`}
        >
          <Text className="text-white font-semibold">
            {purchasePack.isPending ? 'Processing...' : 'Purchase'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Listing Packs</Text>
      </View>

      {/* Current quota */}
      {quota && (
        <View className="mx-4 mt-4 bg-primary-50 border border-primary-200 rounded-xl p-3">
          <Text className="text-sm font-semibold text-primary-900">Current Quota</Text>
          <Text className="text-sm text-primary-700 mt-0.5">
            {quota.free_remaining} free slot{quota.free_remaining !== 1 ? 's' : ''} +{' '}
            {quota.paid_remaining} paid slot{quota.paid_remaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 mb-4 text-center">Failed to load listing packs.</Text>
          <Button onPress={() => refetch()} variant="secondary">
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList<ListingPackResponse>
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center pt-12">
              <Text className="text-lg font-semibold text-gray-600">
                No packs available in your country
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
