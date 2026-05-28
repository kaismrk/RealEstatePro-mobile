import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { useCreateProperty } from '@/hooks/useCreateProperty';
import { Button } from '@/components/ui/Button';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';
import type { PropertyCreatePayload } from '@/hooks/useCreateProperty';

function ReviewRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={rrStyles.row}>
      <Text style={rrStyles.label}>{label}</Text>
      <Text style={rrStyles.value}>{String(value)}</Text>
    </View>
  );
}

const rrStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    width: 144,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
});

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
    <View style={rsStyles.wrap}>
      <View style={rsStyles.header}>
        <Text style={rsStyles.title}>{title}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/listings/create/step-${stepIndex}` as never)}
          accessibilityRole="button"
        >
          <Text style={rsStyles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={rsStyles.body}>{children}</View>
    </View>
  );
}

const rsStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  editLink: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  body: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Review</Text>
        <Text style={styles.stepSubtitle}>Step 5 of 5 — Review &amp; Submit</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Validation errors from 422 */}
        {fieldErrors.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>Please fix these issues:</Text>
            {fieldErrors.map((e, i) => (
              <Text key={i} style={styles.errorBoxItem}>
                {'•'} {e}
              </Text>
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
          <View style={styles.photoCountWrap}>
            <Text style={styles.photoCountText}>
              {imageCount > 0
                ? `${imageCount} photo${imageCount !== 1 ? 's' : ''} selected`
                : 'No photos added'}
            </Text>
          </View>
        </ReviewSection>

        <View style={styles.scrollBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Listing Quota Exhausted</Text>
            <Text style={styles.modalBody}>
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
              style={styles.modalCancel}
              onPress={() => setShowQuotaModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackBtn: {
    marginBottom: 8,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  screenTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxTitle: {
    color: '#B91C1C',
    fontWeight: fontWeight.semibold,
    marginBottom: 4,
    fontSize: fontSize.sm,
  },
  errorBoxItem: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  photoCountWrap: {
    paddingVertical: 8,
  },
  photoCountText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  scrollBottom: {
    height: 128,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: colors.textTertiary,
    fontSize: fontSize.base,
  },
});
