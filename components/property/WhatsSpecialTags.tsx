import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';
import { colors, radius, fontWeight } from '@/constants/theme';

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
    <View style={styles.container}>
      <Text style={styles.heading}>What's Special</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {activeTags.map((label) => (
            <View key={label} style={styles.tag}>
              <Text style={styles.tagText}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: fontWeight.medium,
  },
});
