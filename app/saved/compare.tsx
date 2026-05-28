import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';
import type { PropertySchema } from '@/lib/types/property';

interface CompareField {
  label: string;
  getValue: (p: PropertySchema) => string;
}

const COMPARE_FIELDS: CompareField[] = [
  {
    label: 'Price',
    getValue: (p) =>
      p.price != null ? p.price.toLocaleString() : '—',
  },
  {
    label: 'Type',
    getValue: (p) => p.property_type ?? '—',
  },
  {
    label: 'Listing',
    getValue: (p) => p.listing_type ?? '—',
  },
  {
    label: 'Beds',
    getValue: (p) =>
      p.bedrooms != null ? String(p.bedrooms) : '—',
  },
  {
    label: 'Baths',
    getValue: (p) =>
      p.bathrooms != null ? String(p.bathrooms) : '—',
  },
  {
    label: 'Area (m²)',
    getValue: (p) =>
      p.area_sqm != null ? String(p.area_sqm) : '—',
  },
  {
    label: 'City',
    getValue: (p) => p.city ?? '—',
  },
  {
    label: 'Floor',
    getValue: (p) =>
      p.floor != null ? String(p.floor) : '—',
  },
  {
    label: 'Pool',
    getValue: (p) =>
      p.swimming_pool != null
        ? p.swimming_pool
          ? 'Yes'
          : 'No'
        : '—',
  },
  {
    label: 'Garden',
    getValue: (p) =>
      p.garden != null ? (p.garden ? 'Yes' : 'No') : '—',
  },
  {
    label: 'Balcony',
    getValue: (p) =>
      p.balcony != null ? (p.balcony ? 'Yes' : 'No') : '—',
  },
  {
    label: 'Parking',
    getValue: (p) =>
      p.parking_spots != null ? String(p.parking_spots) : '—',
  },
  {
    label: 'Energy',
    getValue: (p) => p.energy_rating ?? '—',
  },
];

const COLUMN_WIDTH = 140;
const LABEL_WIDTH = 100;

export default function CompareScreen() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { list } = useFavorites();

  const selectedProperties = useMemo<PropertySchema[]>(() => {
    if (!ids || !list.data) return [];
    const idSet = new Set(
      ids.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))
    );
    return list.data.items
      .filter((f) => idSet.has(f.property_id))
      .map((f) => f.property);
  }, [ids, list.data]);

  if (list.isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (selectedProperties.length < 2) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Select at least 2 homes</Text>
        <Text style={styles.emptySubtitle}>
          Go back and select 2–5 homes to compare them.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Icon name="x" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Compare {selectedProperties.length} Homes
        </Text>
      </View>

      {/* Comparison table — horizontally scrollable */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* Property title row */}
          <View style={styles.titleRow}>
            <View style={[styles.labelCell, { width: LABEL_WIDTH }]}>
              <Text style={styles.propertyColumnHeader}>Property</Text>
            </View>
            {selectedProperties.map((p) => (
              <View
                key={p.id}
                style={[styles.dataCell, { width: COLUMN_WIDTH }, styles.dataCellBorderLeft]}
              >
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {p.title}
                </Text>
                <Text style={styles.propertyCity} numberOfLines={1}>
                  {p.city}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {COMPARE_FIELDS.map((field, rowIndex) => (
            <View
              key={field.label}
              style={[
                styles.dataRow,
                rowIndex % 2 === 0 ? styles.dataRowEven : styles.dataRowOdd,
              ]}
            >
              {/* Row label */}
              <View style={[styles.labelCell, { width: LABEL_WIDTH }]}>
                <Text style={styles.rowLabel}>{field.label}</Text>
              </View>

              {/* Property values */}
              {selectedProperties.map((p) => (
                <View
                  key={p.id}
                  style={[styles.dataCell, { width: COLUMN_WIDTH }, styles.dataCellBorderLeft]}
                >
                  <Text style={styles.cellValue}>{field.getValue(p)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  goBackBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    marginRight: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  titleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
  },
  labelCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dataCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dataCellBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  propertyColumnHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  propertyTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  propertyCity: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataRowEven: {
    backgroundColor: colors.surface,
  },
  dataRowOdd: {
    backgroundColor: colors.surfaceMuted,
  },
  rowLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
  },
  cellValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
