import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';
import type { ListingType, PropertyType } from '@/lib/types/property';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'building', label: 'Building' },
];

export default function CreateStep1() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);
  const countryCode = useAuthStore((s) => s.countryCode);

  const [listingType, setListingType] = useState<ListingType>(
    (draft?.listing_type as ListingType) ?? 'sale'
  );
  const [propertyType, setPropertyType] = useState<PropertyType | null>(
    (draft?.property_type as PropertyType) ?? null
  );
  const [title, setTitle] = useState<string>((draft?.title as string) ?? '');
  const [price, setPrice] = useState<string>(
    draft?.price != null ? String(draft.price) : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = 'A valid price is required';
    if (!propertyType) newErrors.property_type = 'Select a property type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    setDraft({
      listing_type: listingType,
      property_type: propertyType as string,
      title: title.trim(),
      price: Number(price),
      country_code: countryCode,
    });
    router.push('/listings/create/step-2');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.linkText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Create Listing</Text>
        <Text style={styles.stepSubtitle}>Step 1 of 5 — Basic Info</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Listing Type */}
        <Text style={styles.sectionLabel}>
          Listing Type <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {LISTING_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              onPress={() => setListingType(lt.value)}
              style={[
                styles.chip,
                listingType === lt.value ? styles.chipActive : styles.chipInactive,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: listingType === lt.value }}
            >
              <Text
                style={[
                  styles.chipText,
                  listingType === lt.value ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Type */}
        <Text style={styles.sectionLabel}>
          Property Type <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.value}
              onPress={() => setPropertyType(pt.value)}
              style={[
                styles.chipSm,
                propertyType === pt.value ? styles.chipActive : styles.chipInactive,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: propertyType === pt.value }}
            >
              <Text
                style={[
                  styles.chipText,
                  propertyType === pt.value ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.property_type ? (
          <Text style={styles.errorText}>{errors.property_type}</Text>
        ) : (
          <View style={styles.spacerMb5} />
        )}

        {/* Title */}
        <Text style={styles.fieldLabel}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Spacious 3-bedroom apartment in city center"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, errors.title ? styles.inputError : styles.inputNormal]}
          accessibilityLabel="Listing title"
        />
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title}</Text>
        ) : (
          <View style={styles.spacerMb4} />
        )}

        {/* Price */}
        <Text style={styles.fieldLabel}>
          Price <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[styles.input, errors.price ? styles.inputError : styles.inputNormal]}
          accessibilityLabel="Price"
        />
        {errors.price ? (
          <Text style={styles.errorText}>{errors.price}</Text>
        ) : (
          <View style={styles.spacerMb4} />
        )}

        <View style={styles.scrollBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleNext} size="lg">
          Next: Location
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
  sectionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  required: {
    color: colors.error,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.textOnBrand,
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  inputNormal: {
    borderColor: colors.borderStrong,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginBottom: 12,
  },
  spacerMb4: {
    marginBottom: 16,
  },
  spacerMb5: {
    marginBottom: 20,
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
});
