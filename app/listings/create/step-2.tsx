import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { RegionPicker } from '@/components/geo/RegionPicker';
import { RegionBreadcrumb } from '@/components/geo/RegionBreadcrumb';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';
import type { Region } from '@/hooks/useRegions';

const DISCLOSURE_LEVELS = [
  { value: 'exact', label: 'Exact address (shown on map)' },
  { value: 'approximate', label: 'Approximate location' },
  { value: 'city_only', label: 'City only' },
];

export default function CreateStep2() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);
  const countryCode = useAuthStore((s) => s.countryCode);

  const [regionId, setRegionId] = useState<number | null>(
    (draft?.region_id as number | null) ?? null
  );
  const [locationPath, setLocationPath] = useState<Region[]>([]);
  const [city, setCity] = useState<string>((draft?.city as string) ?? '');
  const [address, setAddress] = useState<string>((draft?.address as string) ?? '');
  const [zipCode, setZipCode] = useState<string>((draft?.zip_code as string) ?? '');
  const [disclosureLevel, setDisclosureLevel] = useState<string>(
    (draft?.address_disclosure_level as string) ?? 'approximate'
  );
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleUseLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode) {
        if (geocode.city) setCity(geocode.city);
        const parts = [geocode.streetNumber, geocode.street].filter(Boolean);
        if (parts.length > 0) setAddress(parts.join(' '));
        if (geocode.postalCode) setZipCode(geocode.postalCode);
      }
    } catch {
      Alert.alert('Error', 'Could not retrieve location. Please enter manually.');
    } finally {
      setLocating(false);
    }
  }

  function handleNext() {
    if (!validate()) return;
    setDraft({
      region_id: regionId ?? null,
      city: city.trim(),
      address: address.trim() || null,
      zip_code: zipCode.trim() || null,
      address_disclosure_level: disclosureLevel,
    });
    router.push('/listings/create/step-3');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Location</Text>
        <Text style={styles.stepSubtitle}>Step 2 of 5 — Location</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Region picker — cascading geo hierarchy */}
        <View style={styles.regionPickerWrap}>
          <RegionPicker
            countryCode={countryCode}
            value={regionId}
            onChange={(id, path) => {
              setRegionId(id);
              setLocationPath(path);
              // Auto-fill city from selected city name
              if (path.length > 0) {
                const cityNode = path[path.length - 1];
                if (cityNode.level === 'city') {
                  setCity(cityNode.name);
                }
              }
            }}
          />
          {locationPath.length > 0 && (
            <RegionBreadcrumb path={locationPath} style={styles.breadcrumb} />
          )}
        </View>

        {/* Use current location */}
        <TouchableOpacity
          onPress={handleUseLocation}
          disabled={locating}
          style={styles.locationBtn}
          accessibilityRole="button"
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Icon name="map-pin" size={18} color={colors.primary} style={styles.locationIcon} />
              <Text style={styles.locationBtnText}>Use my current location</Text>
            </>
          )}
        </TouchableOpacity>

        {/* City */}
        <Text style={styles.fieldLabel}>
          City <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Tunis"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, errors.city ? styles.inputError : styles.inputNormal]}
          accessibilityLabel="City"
        />
        {errors.city ? (
          <Text style={styles.errorText}>{errors.city}</Text>
        ) : (
          <View style={styles.spacerMb4} />
        )}

        {/* Address */}
        <Text style={styles.fieldLabel}>
          Address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 12 Rue de la Paix"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, errors.address ? styles.inputError : styles.inputNormal]}
          accessibilityLabel="Address"
        />
        {errors.address ? (
          <Text style={styles.errorText}>{errors.address}</Text>
        ) : (
          <View style={styles.spacerMb4} />
        )}

        {/* Zip Code */}
        <Text style={styles.fieldLabel}>Zip Code</Text>
        <TextInput
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="e.g. 1000"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[styles.input, styles.inputNormal, styles.mb5]}
          accessibilityLabel="Zip code"
        />

        {/* Address Disclosure Level */}
        <Text style={styles.fieldLabel}>Address Visibility</Text>
        {DISCLOSURE_LEVELS.map((dl) => (
          <TouchableOpacity
            key={dl.value}
            onPress={() => setDisclosureLevel(dl.value)}
            style={[
              styles.disclosureRow,
              disclosureLevel === dl.value
                ? styles.disclosureRowActive
                : styles.disclosureRowInactive,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: disclosureLevel === dl.value }}
          >
            <View
              style={[
                styles.radioOuter,
                disclosureLevel === dl.value
                  ? styles.radioOuterActive
                  : styles.radioOuterInactive,
              ]}
            >
              {disclosureLevel === dl.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.disclosureLabel}>{dl.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.scrollBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleNext} size="lg">
          Next: Property Details
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
  regionPickerWrap: {
    marginBottom: 20,
  },
  breadcrumb: {
    marginTop: 8,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: 20,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationBtnText: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
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
  mb5: {
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginBottom: 12,
  },
  spacerMb4: {
    marginBottom: 16,
  },
  disclosureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  disclosureRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  disclosureRowInactive: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioOuterInactive: {
    borderColor: colors.textTertiary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  disclosureLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
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
