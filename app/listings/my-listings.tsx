import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useMyListings } from '@/hooks/useMyListings';
import { useDeleteProperty } from '@/hooks/useDeleteProperty';
import { useListingQuota } from '@/hooks/useUser';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';
import { PublishStatusBadge } from '@/components/property/PublishStatusBadge';
import { CurrencyText } from '@/components/ui/CurrencyText';
import { Button } from '@/components/ui/Button';
import type { PropertySchema, PublishStatus } from '@/lib/types/property';

function QuotaExhaustedModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full">
          <Text className="text-xl font-bold text-gray-900 mb-2">Quota Exhausted</Text>
          <Text className="text-base text-gray-600 mb-5">
            You have no remaining listing slots. Purchase a pack to create more listings.
          </Text>
          <Button
            onPress={() => {
              onClose();
              router.push('/listings/packs');
            }}
            size="lg"
          >
            Purchase a Pack
          </Button>
          <TouchableOpacity className="mt-3 items-center py-2" onPress={onClose}>
            <Text className="text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function RejectionModal({
  visible,
  reason,
  onClose,
}: {
  visible: boolean;
  reason: string | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Rejection Reason</Text>
          <Text className="text-base text-gray-700 mb-5">
            {reason ?? 'No reason provided.'}
          </Text>
          <Button onPress={onClose} variant="secondary">
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
}

function ListingCard({
  item,
  currency,
  onEdit,
  onDelete,
  onBoost,
  onViewRejection,
}: {
  item: PropertySchema;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onBoost: () => void;
  onViewRejection: () => void;
}) {
  const coverImage = item.image_urls?.[0];

  return (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden"
      onPress={() => router.push(`/property/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Cover image */}
      <View className="h-36 bg-gray-200">
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel="Property photo"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl">🏠</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        {/* Status badge row */}
        <View className="flex-row items-center justify-between mb-2">
          {item.publish_status ? (
            <TouchableOpacity
              onPress={item.publish_status === 'rejected' ? onViewRejection : undefined}
              disabled={item.publish_status !== 'rejected'}
              accessibilityRole={item.publish_status === 'rejected' ? 'button' : 'none'}
            >
              <PublishStatusBadge status={item.publish_status as PublishStatus} />
            </TouchableOpacity>
          ) : null}
          {item.is_boosted && (
            <View className="bg-yellow-100 rounded-full px-2 py-0.5">
              <Text className="text-xs text-yellow-700 font-semibold">Boosted</Text>
            </View>
          )}
        </View>

        <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
          {item.title}
        </Text>

        <CurrencyText
          amount={item.price}
          currency={currency}
          className="text-base font-bold text-primary-500 mb-2"
        />

        {/* Action row */}
        <View className="flex-row gap-2 mt-1">
          <TouchableOpacity
            className="flex-1 border border-gray-300 rounded-xl py-2 items-center"
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit listing"
          >
            <Text className="text-xs text-gray-700 font-medium">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 border border-red-300 rounded-xl py-2 items-center"
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Text className="text-xs text-red-600 font-medium">Delete</Text>
          </TouchableOpacity>
          {item.publish_status === 'published' && (
            <TouchableOpacity
              className="flex-1 border border-primary-500 rounded-xl py-2 items-center"
              onPress={onBoost}
              accessibilityRole="button"
              accessibilityLabel="Boost listing"
            >
              <Text className="text-xs text-primary-500 font-medium">Boost</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyListingsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { data, isLoading, isRefetching, isError, refetch } = useMyListings();
  const { data: quota } = useListingQuota();
  const deleteProperty = useDeleteProperty();

  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{
    visible: boolean;
    reason: string | null;
  }>({ visible: false, reason: null });

  // Simple currency mapping
  const currency = countryCode === 'TN' ? 'TND' : countryCode === 'MA' ? 'MAD' : 'USD';

  if (!accessToken) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Sign in required</Text>
        <Button onPress={() => router.push('/(auth)/welcome')} size="lg">
          Sign In
        </Button>
      </View>
    );
  }

  function handleCreate() {
    const totalRemaining = (quota?.free_remaining ?? 0) + (quota?.paid_remaining ?? 0);
    if (totalRemaining <= 0) {
      setShowQuotaModal(true);
      return;
    }
    router.push('/listings/create/step-1');
  }

  function handleDelete(id: number, title: string) {
    void haptic.warning();
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProperty.mutate(id),
        },
      ]
    );
  }

  function renderItem({ item }: ListRenderItemInfo<PropertySchema>) {
    return (
      <ListingCard
        item={item}
        currency={currency}
        onEdit={() => router.push(`/property/${item.id}/edit`)}
        onDelete={() => handleDelete(item.id, item.title)}
        onBoost={() => router.push(`/property/${item.id}/boost`)}
        onViewRejection={() =>
          setRejectionModal({ visible: true, reason: item.rejection_reason })
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-900">My Listings</Text>
          {quota && (
            <Text className="text-xs text-gray-500 mt-0.5">
              {quota.free_remaining} free + {quota.paid_remaining} paid slots remaining
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleCreate}
          className="bg-primary-500 rounded-xl px-4 py-2"
          accessibilityRole="button"
          accessibilityLabel="Create new listing"
        >
          <Text className="text-white text-sm font-semibold">+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 mb-4 text-center">Failed to load your listings.</Text>
          <Button onPress={() => refetch()} variant="secondary">
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList<PropertySchema>
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => void refetch()}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-16">
              <Text className="text-5xl mb-4">🏠</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-2">No listings yet</Text>
              <Text className="text-gray-500 text-center mb-6">
                Create your first listing to start selling or renting.
              </Text>
              <Button onPress={handleCreate} size="lg">
                Create Listing
              </Button>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <QuotaExhaustedModal
        visible={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />

      <RejectionModal
        visible={rejectionModal.visible}
        reason={rejectionModal.reason}
        onClose={() => setRejectionModal({ visible: false, reason: null })}
      />
    </View>
  );
}
