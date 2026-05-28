import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { useBoost, type PlacementType } from '@/hooks/useBoost';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

const PLACEMENT_OPTIONS: { value: PlacementType; label: string; description: string; pricePerDay: number }[] = [
  {
    value: 'top_of_search',
    label: 'Top of Search',
    description: 'Your listing appears at the top of all search results.',
    pricePerDay: 5,
  },
  {
    value: 'homepage_featured',
    label: 'Homepage Featured',
    description: 'Featured prominently on the homepage for all visitors.',
    pricePerDay: 10,
  },
  {
    value: 'category_featured',
    label: 'Category Featured',
    description: 'Featured at the top of your property category.',
    pricePerDay: 7,
  },
];

const DURATION_OPTIONS = [7, 14, 30];

export default function BoostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property } = useProperty(id);
  const currentUser = useAuthStore((s) => s.user);
  const boost = useBoost();

  const [selectedPlacement, setSelectedPlacement] = useState<PlacementType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);

  // Only owner can boost
  if (property && currentUser && property.owner_id !== currentUser.id) {
    return (
      <View style={[styles.centered, styles.centeredPadded]}>
        <Text style={styles.accessTitle}>Access denied</Text>
        <Text style={styles.accessSubtitle}>
          Only the property owner can boost this listing.
        </Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  const pricePerDay =
    PLACEMENT_OPTIONS.find((p) => p.value === selectedPlacement)?.pricePerDay ?? 0;
  const totalCost = pricePerDay * selectedDuration;

  function handleBoost() {
    if (!selectedPlacement) {
      Alert.alert('Select placement', 'Please choose a placement type to boost your listing.');
      return;
    }

    boost.mutate(
      {
        propertyId,
        payload: {
          placement_type: selectedPlacement,
          duration_days: selectedDuration,
          amount_paid: totalCost,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Boost activated!', `Your listing is now boosted for ${selectedDuration} days.`, [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to create boost. Please try again.');
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boost Listing</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {property && (
          <View style={styles.listingCard}>
            <Text style={styles.listingCardLabel}>Listing</Text>
            <Text style={styles.listingCardTitle} numberOfLines={1}>
              {property.title}
            </Text>
          </View>
        )}

        {/* Placement type */}
        <Text style={styles.sectionTitle}>
          Placement Type <Text style={styles.requiredStar}>*</Text>
        </Text>
        {PLACEMENT_OPTIONS.map((opt) => {
          const isSelected = selectedPlacement === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSelectedPlacement(opt.value)}
              style={[styles.placementOption, isSelected ? styles.placementOptionSelected : styles.placementOptionUnselected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.radioOuter, isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.placementContent}>
                <Text style={styles.placementLabel}>{opt.label}</Text>
                <Text style={styles.placementDescription}>{opt.description}</Text>
                <Text style={styles.placementPrice}>{opt.pricePerDay} TND/day</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Duration */}
        <Text style={styles.durationTitle}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map((days) => {
            const isSelected = selectedDuration === days;
            return (
              <TouchableOpacity
                key={days}
                onPress={() => setSelectedDuration(days)}
                style={[styles.durationBtn, isSelected ? styles.durationBtnSelected : styles.durationBtnUnselected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <Text
                  style={[
                    styles.durationBtnText,
                    isSelected ? styles.durationBtnTextSelected : styles.durationBtnTextUnselected,
                  ]}
                >
                  {days} days
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cost summary */}
        {selectedPlacement && (
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costAmount}>{totalCost.toFixed(2)} TND</Text>
            <Text style={styles.costBreakdown}>
              {pricePerDay} TND/day × {selectedDuration} days
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleBoost} loading={boost.isPending} size="lg">
          Boost Now
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredPadded: {
    paddingHorizontal: 24,
  },
  accessTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  accessSubtitle: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.base,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listingCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 20,
  },
  listingCardLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  listingCardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  requiredStar: {
    color: colors.error,
  },
  placementOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  placementOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  placementOptionUnselected: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioOuterUnselected: {
    borderColor: colors.borderStrong,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  placementContent: {
    flex: 1,
  },
  placementLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  placementDescription: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  placementPrice: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 4,
  },
  durationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationBtnUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  durationBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  durationBtnTextSelected: {
    color: colors.textOnBrand,
  },
  durationBtnTextUnselected: {
    color: colors.textSecondary,
  },
  costCard: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
  },
  costLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  costAmount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  costBreakdown: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  bottomSpacer: {
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
});
