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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <View style={rsStyles.wrap}>
      <View style={rsStyles.header}>
        <Text style={rsStyles.title}>{title}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/listings/create/step-${stepIndex}` as never)}
          accessibilityRole="button"
        >
          <Text style={rsStyles.editLink}>{t('listings.create.step5.editLink')}</Text>
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
  const { t } = useTranslation();
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
        Alert.alert(
          t('listings.create.step5.success.title'),
          t('listings.create.step5.success.body'),
          [
            {
              text: t('listings.create.step5.success.viewMyListings'),
              onPress: () => router.replace('/listings/my-listings'),
            },
          ]
        );
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
        Alert.alert(t('common.error'), err.message ?? t('listings.create.step5.error'));
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
          <Text style={styles.linkText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t('listings.create.step5.reviewTitle')}</Text>
        <Text style={styles.stepSubtitle}>{t('listings.create.step5.subtitle')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Validation errors from 422 */}
        {fieldErrors.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>{t('listings.create.step5.errors.title')}</Text>
            {fieldErrors.map((e, i) => (
              <Text key={i} style={styles.errorBoxItem}>
                {'•'} {e}
              </Text>
            ))}
          </View>
        )}

        <ReviewSection title={t('listings.create.step5.sections.basicInfo')} stepIndex={1}>
          <ReviewRow label={t('listings.create.step5.fields.title')} value={d.title as string} />
          <ReviewRow
            label={t('listings.create.step5.fields.listingType')}
            value={d.listing_type ? t(`listings.listingTypes.${d.listing_type as string}`) : null}
          />
          <ReviewRow
            label={t('listings.create.step5.fields.propertyType')}
            value={d.property_type ? t(`listings.propertyTypes.${d.property_type as string}`) : null}
          />
          <ReviewRow label={t('listings.create.step5.fields.price')} value={d.price as number} />
        </ReviewSection>

        <ReviewSection title={t('listings.create.step5.sections.location')} stepIndex={2}>
          <ReviewRow label={t('listings.create.step5.fields.city')} value={d.city as string} />
          <ReviewRow label={t('listings.create.step5.fields.address')} value={d.address as string} />
          <ReviewRow label={t('listings.create.step5.fields.zipCode')} value={d.zip_code as string} />
          <ReviewRow
            label={t('listings.create.step5.fields.visibility')}
            value={d.address_disclosure_level ? t(`listings.disclosureLevels.${d.address_disclosure_level as string}`) : null}
          />
        </ReviewSection>

        <ReviewSection title={t('listings.create.step5.sections.propertyDetails')} stepIndex={3}>
          <ReviewRow label={t('listings.create.step5.fields.area')} value={d.area_sqm as number} />
          <ReviewRow label={t('listings.create.step5.fields.bedrooms')} value={d.bedrooms as number} />
          <ReviewRow label={t('listings.create.step5.fields.bathrooms')} value={d.bathrooms as number} />
          <ReviewRow label={t('listings.create.step5.fields.floor')} value={d.floor as number} />
          <ReviewRow label={t('listings.create.step5.fields.yearBuilt')} value={d.year_built as number} />
          <ReviewRow
            label={t('listings.create.step5.fields.furnished')}
            value={(d.furnished as boolean) ? t('listings.create.step5.yes') : t('listings.create.step5.no')}
          />
          <ReviewRow
            label={t('listings.create.step5.fields.heating')}
            value={d.heating_system ? t(`listings.heatingTypes.${d.heating_system as string}`) : null}
          />
          <ReviewRow
            label={t('listings.create.step5.fields.kitchen')}
            value={d.kitchen_type ? t(`listings.kitchenTypes.${d.kitchen_type as string}`) : null}
          />
          <ReviewRow label={t('listings.create.step5.fields.energyRating')} value={d.energy_rating as string} />
        </ReviewSection>

        <ReviewSection title={t('listings.create.step5.sections.photos')} stepIndex={4}>
          <View style={styles.photoCountWrap}>
            <Text style={styles.photoCountText}>
              {imageCount > 0
                ? t('listings.create.step5.photos.selected', { count: imageCount })
                : t('listings.create.step5.photos.none')}
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
          {t('listings.create.step5.submit')}
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
            <Text style={styles.modalTitle}>{t('listings.create.step5.quota.title')}</Text>
            <Text style={styles.modalBody}>{t('listings.create.step5.quota.body')}</Text>
            <Button
              onPress={() => {
                setShowQuotaModal(false);
                router.push('/listings/packs');
              }}
              size="lg"
            >
              {t('listings.create.step5.quota.action')}
            </Button>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowQuotaModal(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
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
    borderColor: colors.errorBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxTitle: {
    color: colors.error,
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
