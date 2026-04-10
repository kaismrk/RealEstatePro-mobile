import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { useCreateProperty } from '@/hooks/useCreateProperty';
import { Button } from '@/components/ui/Button';
import type { PropertyCreatePayload } from '@/hooks/useCreateProperty';

function ReviewRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View className="flex-row py-2 border-b border-gray-50">
      <Text className="text-sm text-gray-500 w-36">{label}</Text>
      <Text className="text-sm text-gray-900 flex-1">{String(value)}</Text>
    </View>
  );
}

function ReviewSection({
  title,
  stepIndex,
  children,
}: {
  title: string;
  stepIndex: number;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-gray-900">{title}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/listings/create/step-${stepIndex}` as never)}
          accessibilityRole="button"
        >
          <Text className="text-blue-600 text-sm">Edit</Text>
        </TouchableOpacity>
      </View>
      <View className="bg-gray-50 rounded-xl px-4 py-1">{children}</View>
    </View>
  );
}

export default function CreateStep5() {
  const draft = useUIStore((s) => s.createListingDraft);
  const clearDraft = useUIStore((s) => s.clearDraft);
  const createProperty = useCreateProperty();

  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  function buildPayload(): PropertyCreatePayload {
    const d = draft ?? {};
    return {
      title: (d.title as string) ?? '',
      listing_type: (d.listing_type as string) ?? 'sale',
      property_type: (d.property_type as string) ?? 'apartment',
      price: (d.price as number) ?? 0,
      country_code: (d.country_code as string) ?? 'TN',
      city: (d.city as string) ?? '',
      description: (d.description as string) ?? null,
      address: (d.address as string) ?? null,
      address_disclosure_level: (d.address_disclosure_level as string) ?? null,
      zip_code: (d.zip_code as string) ?? null,
      area_sqm: (d.area_sqm as number) ?? null,
      lot_size: (d.lot_size as number) ?? null,
      number_of_rooms: (d.number_of_rooms as number) ?? null,
      bedrooms: (d.bedrooms as number) ?? null,
      bathrooms: (d.bathrooms as number) ?? null,
      floor: (d.floor as number) ?? null,
      total_floors: (d.total_floors as number) ?? null,
      year_built: (d.year_built as number) ?? null,
      furnished: (d.furnished as boolean) ?? null,
      kitchen_type: (d.kitchen_type as string) ?? null,
      heating_system: (d.heating_system as string) ?? null,
      air_conditioner: (d.air_conditioner as string) ?? null,
      energy_rating: (d.energy_rating as string) ?? null,
      swimming_pool: (d.swimming_pool as boolean) ?? null,
      garden: (d.garden as boolean) ?? null,
      balcony: (d.balcony as boolean) ?? null,
      lift: (d.lift as boolean) ?? null,
      garage_spots: (d.garage_spots as number) ?? null,
      parking_spots: (d.parking_spots as number) ?? null,
      image_urls: Array.isArray(d.image_urls) ? (d.image_urls as string[]) : [],
    };
  }

  function handleSubmit() {
    const payload = buildPayload();

    createProperty.mutate(payload, {
      onSuccess: () => {
        clearDraft();
        Alert.alert('Success', 'Your listing has been submitted for review!', [
          {
            text: 'View My Listings',
            onPress: () => router.replace('/listings/my-listings'),
          },
        ]);
      },
      onError: (err) => {
        if (err.name === 'QuotaExhaustedError') {
          setShowQuotaModal(true);
          return;
        }
        // Check for 422 validation errors
        const anyErr = err as unknown as { response?: { data?: { detail?: unknown } } };
        if (anyErr?.response?.data?.detail) {
          const detail = anyErr.response.data.detail;
          if (Array.isArray(detail)) {
            const msgs = detail.map((e: { loc?: string[]; msg?: string }) =>
              e.loc ? `${e.loc.join('.')} — ${e.msg}` : String(e.msg ?? e)
            );
            setFieldErrors(msgs);
            return;
          }
        }
        Alert.alert('Error', err.message ?? 'Failed to create listing. Please try again.');
      },
    });
  }

  const d = draft ?? {};
  const imageCount = Array.isArray(d.image_urls) ? (d.image_urls as string[]).length : 0;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-600 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Review</Text>
        <Text className="text-sm text-gray-500 mt-1">Step 5 of 5 — Review &amp; Submit</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Validation errors from 422 */}
        {fieldErrors.length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-red-700 font-semibold mb-1">Please fix these issues:</Text>
            {fieldErrors.map((e, i) => (
              <Text key={i} className="text-red-600 text-sm">• {e}</Text>
            ))}
          </View>
        )}

        <ReviewSection title="Basic Info" stepIndex={1}>
          <ReviewRow label="Title" value={d.title as string} />
          <ReviewRow label="Listing Type" value={d.listing_type as string} />
          <ReviewRow label="Property Type" value={d.property_type as string} />
          <ReviewRow label="Price" value={d.price as number} />
        </ReviewSection>

        <ReviewSection title="Location" stepIndex={2}>
          <ReviewRow label="City" value={d.city as string} />
          <ReviewRow label="Address" value={d.address as string} />
          <ReviewRow label="Zip Code" value={d.zip_code as string} />
          <ReviewRow label="Visibility" value={d.address_disclosure_level as string} />
        </ReviewSection>

        <ReviewSection title="Property Details" stepIndex={3}>
          <ReviewRow label="Area (m²)" value={d.area_sqm as number} />
          <ReviewRow label="Bedrooms" value={d.bedrooms as number} />
          <ReviewRow label="Bathrooms" value={d.bathrooms as number} />
          <ReviewRow label="Floor" value={d.floor as number} />
          <ReviewRow label="Year Built" value={d.year_built as number} />
          <ReviewRow label="Furnished" value={(d.furnished as boolean) ? 'Yes' : 'No'} />
          <ReviewRow label="Heating" value={d.heating_system as string} />
          <ReviewRow label="Kitchen" value={d.kitchen_type as string} />
          <ReviewRow label="Energy Rating" value={d.energy_rating as string} />
        </ReviewSection>

        <ReviewSection title="Photos" stepIndex={4}>
          <View className="py-2">
            <Text className="text-sm text-gray-900">
              {imageCount > 0 ? `${imageCount} photo${imageCount !== 1 ? 's' : ''} selected` : 'No photos added'}
            </Text>
          </View>
        </ReviewSection>

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button
          onPress={handleSubmit}
          loading={createProperty.isPending}
          size="lg"
        >
          Submit Listing
        </Button>
      </View>

      {/* Quota Exhausted Modal */}
      <Modal
        visible={showQuotaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuotaModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-gray-900 mb-2">Listing Quota Exhausted</Text>
            <Text className="text-base text-gray-600 mb-5">
              You have used all your free and paid listing slots. Purchase a pack to continue posting.
            </Text>
            <Button
              onPress={() => {
                setShowQuotaModal(false);
                router.push('/listings/packs');
              }}
              size="lg"
            >
              Purchase a Pack
            </Button>
            <TouchableOpacity
              className="mt-3 items-center py-2"
              onPress={() => setShowQuotaModal(false)}
            >
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
