import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth.store';
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

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty();
  const currentUser = useAuthStore((s) => s.user);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqm, setAreaSqm] = useState('');

  // Pre-fill from loaded property
  useEffect(() => {
    if (!property) return;
    setTitle(property.title ?? '');
    setPrice(property.price != null ? String(property.price) : '');
    setListingType((property.listing_type as ListingType) ?? 'sale');
    setPropertyType((property.property_type as PropertyType) ?? 'apartment');
    setCity(property.city ?? '');
    setAddress(property.address ?? '');
    setDescription(property.description ?? '');
    setBedrooms(property.bedrooms != null ? String(property.bedrooms) : '');
    setBathrooms(property.bathrooms != null ? String(property.bathrooms) : '');
    setAreaSqm(property.area_sqm != null ? String(property.area_sqm) : '');
  }, [property]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.centered, styles.centeredPadded]}>
        <Text style={styles.accessTitle}>Property not found</Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  // Only owner can edit
  if (currentUser && property.owner_id !== currentUser.id) {
    return (
      <View style={[styles.centered, styles.centeredPadded]}>
        <Text style={styles.accessTitle}>Access denied</Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  function numOrNull(v: string): number | null {
    const n = Number(v);
    return v.trim() !== '' && !isNaN(n) ? n : null;
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation', 'A valid price is required.');
      return;
    }

    updateProperty.mutate(
      {
        id: propertyId,
        data: {
          title: title.trim(),
          price: Number(price),
          listing_type: listingType,
          property_type: propertyType,
          city: city.trim(),
          address: address.trim() || null,
          description: description.trim() || null,
          bedrooms: numOrNull(bedrooms),
          bathrooms: numOrNull(bathrooms),
          area_sqm: numOrNull(areaSqm),
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your listing has been updated.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to update listing.');
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Listing Type */}
        <Text style={styles.fieldLabel}>Listing Type</Text>
        <View style={styles.chipRow}>
          {LISTING_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              onPress={() => setListingType(lt.value)}
              style={[
                styles.chip,
                listingType === lt.value ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  listingType === lt.value ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Type */}
        <Text style={styles.fieldLabel}>Property Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollView}
        >
          <View style={styles.chipRow}>
            {PROPERTY_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                onPress={() => setPropertyType(pt.value)}
                style={[
                  styles.chipSm,
                  propertyType === pt.value ? styles.chipSelected : styles.chipUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    propertyType === pt.value ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Input label="Title *" value={title} onChangeText={setTitle} placeholder="Listing title" />
        <Input
          label="Price *"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="0"
        />
        <Input label="City *" value={city} onChangeText={setCity} placeholder="e.g. Tunis" />
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street address"
        />
        <Input
          label="Bedrooms"
          value={bedrooms}
          onChangeText={setBedrooms}
          keyboardType="numeric"
          placeholder="–"
        />
        <Input
          label="Bathrooms"
          value={bathrooms}
          onChangeText={setBathrooms}
          keyboardType="numeric"
          placeholder="–"
        />
        <Input
          label="Area (m²)"
          value={areaSqm}
          onChangeText={setAreaSqm}
          keyboardType="numeric"
          placeholder="–"
        />

        {/* Description */}
        <Text style={styles.fieldLabel}>
          Description ({description.length}/5000)
        </Text>
        <TextInput
          value={description}
          onChangeText={(v) => v.length <= 5000 && setDescription(v)}
          placeholder="Describe the property..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={6}
          style={styles.descriptionInput}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleSave} loading={updateProperty.isPending} size="lg">
          Save Changes
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
    marginRight: 12,
  },
  cancelText: {
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
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  horizontalScrollView: {
    marginBottom: 16,
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
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  chipText: {
    fontSize: fontSize.sm,
  },
  chipTextSelected: {
    color: colors.textOnBrand,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
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
