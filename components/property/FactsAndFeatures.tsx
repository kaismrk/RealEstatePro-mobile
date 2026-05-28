import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';
import { colors, radius, fontWeight } from '@/constants/theme';

interface FactsAndFeaturesProps {
  property: PropertySchema;
}

interface FeatureItem {
  label: string;
  value: string | boolean | null | undefined;
}

interface Section {
  title: string;
  items: FeatureItem[];
}

function formatValue(value: string | boolean | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function CollapsibleSection({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(true);

  const visibleItems = section.items.filter((item) => item.value != null);
  if (visibleItems.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        style={styles.sectionHeader}
        accessibilityRole="button"
        accessibilityLabel={`${section.title}, ${expanded ? 'collapse' : 'expand'}`}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.toggleIcon}>{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionBody}>
          {visibleItems.map((item) => {
            const displayValue = formatValue(item.value);
            if (!displayValue) return null;
            return (
              <View key={item.label} style={styles.row}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{displayValue}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function FactsAndFeatures({ property }: FactsAndFeaturesProps) {
  const sections: Section[] = [
    {
      title: 'Interior',
      items: [
        { label: 'Bedrooms', value: property.bedrooms != null ? String(property.bedrooms) : null },
        { label: 'Bathrooms', value: property.bathrooms != null ? String(property.bathrooms) : null },
        { label: 'Kitchen Type', value: property.kitchen ?? null },
        { label: 'Furnished', value: property.furnished },
        { label: 'Rooms', value: null },
      ],
    },
    {
      title: 'Systems',
      items: [
        { label: 'Heating System', value: property.heating_system ?? null },
        { label: 'Air Conditioner', value: property.air_conditioner ?? null },
        { label: 'Energy Rating', value: property.energy_rating ?? null },
      ],
    },
    {
      title: 'Outdoor',
      items: [
        { label: 'Swimming Pool', value: property.swimming_pool },
        { label: 'Garden', value: property.garden },
        { label: 'Balcony', value: property.balcony },
      ],
    },
    {
      title: 'Parking',
      items: [
        { label: 'Parking', value: property.parking_spots != null ? String(property.parking_spots) + ' spot(s)' : null },
        { label: 'Garage', value: property.garage_spots != null ? String(property.garage_spots) + ' spot(s)' : null },
      ],
    },
  ];

  const sectionsWithData = sections.filter((s) =>
    s.items.some((item) => item.value != null)
  );

  if (sectionsWithData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Facts & Features</Text>
      {sections.map((section) => (
        <CollapsibleSection key={section.title} section={section} />
      ))}
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
  },
  sectionContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSunken,
  },
  sectionTitle: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  toggleIcon: {
    color: colors.textTertiary,
    fontSize: 18,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
});
