import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';

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
    <View className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between px-4 py-3 bg-gray-50"
        accessibilityRole="button"
        accessibilityLabel={`${section.title}, ${expanded ? 'collapse' : 'expand'}`}
      >
        <Text className="font-semibold text-gray-900">{section.title}</Text>
        <Text className="text-gray-400 text-lg">{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 py-2">
          {visibleItems.map((item) => {
            const displayValue = formatValue(item.value);
            if (!displayValue) return null;
            return (
              <View
                key={item.label}
                className="flex-row justify-between items-center py-2 border-b border-gray-100"
              >
                <Text className="text-sm text-gray-600">{item.label}</Text>
                <Text className="text-sm font-medium text-gray-900">{displayValue}</Text>
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
        { label: 'Rooms', value: null }, // number_of_rooms not in schema
      ],
    },
    {
      title: 'Systems',
      items: [
        { label: 'Heating System', value: property.heating_system ?? null },
        { label: 'Air Conditioner', value: property.air_conditioner ?? null },
        { label: 'Energy Rating', value: property.energy_rating ?? null },
        // principal_exposure not in PropertySchema — omitted
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
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">Facts & Features</Text>
      {sections.map((section) => (
        <CollapsibleSection key={section.title} section={section} />
      ))}
    </View>
  );
}
