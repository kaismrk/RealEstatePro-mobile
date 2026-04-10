import { View, Text, ScrollView } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';

interface WhatsSpecialTagsProps {
  property: PropertySchema;
}

interface Tag {
  label: string;
  key: keyof PropertySchema;
}

const TAGS: Tag[] = [
  { key: 'swimming_pool', label: 'Swimming Pool' },
  { key: 'garden', label: 'Private Garden' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'lift', label: 'Elevator' },
  { key: 'furnished', label: 'Furnished' },
];

// Parking tags need special handling for counts
const PARKING_TAGS = [
  { key: 'parking_spots' as keyof PropertySchema, label: 'Parking' },
  { key: 'garage_spots' as keyof PropertySchema, label: 'Garage' },
];

export function WhatsSpecialTags({ property }: WhatsSpecialTagsProps) {
  const activeTags: string[] = [];

  for (const tag of TAGS) {
    if (property[tag.key] === true) {
      activeTags.push(tag.label);
    }
  }

  for (const tag of PARKING_TAGS) {
    const val = property[tag.key];
    if (typeof val === 'number' && val > 0) {
      activeTags.push(tag.label);
    }
  }

  if (activeTags.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">What's Special</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {activeTags.map((label) => (
            <View
              key={label}
              className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5"
            >
              <Text className="text-sm text-blue-700 font-medium">{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
