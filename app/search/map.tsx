import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSearchStore } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProperties } from '@/hooks/useProperties';
import { useMapProperties, radiusKmFromRegion } from '@/hooks/useMapProperties';
import { useCountries } from '@/hooks/useCountries';
import { MapViewWrapper } from '@/components/map/MapViewWrapper';
import { MapControls } from '@/components/map/MapControls';
import { SearchThisAreaButton } from '@/components/map/SearchThisAreaButton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { CountrySelector } from '@/components/shared/CountrySelector';
import type { PropertySchema } from '@/lib/types/property';

const DEBOUNCE_MS = 500;

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const setMapRegion = useSearchStore((s) => s.setMapRegion);
  const mapRegion = useSearchStore((s) => s.mapRegion);

  const countryCode = useAuthStore((s) => s.countryCode);
  const setCountry = useAuthStore((s) => s.setCountry);

  const { data: countries } = useCountries();
  const currency =
    countries?.find((c) => c.country_code === countryCode)?.currency ?? 'TND';

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedProperty, setSelectedProperty] = useState<PropertySchema | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [areaSearchEnabled, setAreaSearchEnabled] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(mapRegion);

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data sources ───────────────────────────────────────────────────────────
  // Initial load: use the same filters as the list view
  const { data: listData } = useProperties();
  const listProperties = listData?.pages.flatMap((p) => p.items) ?? [];

  // Area-based search (triggered manually via "Search this area")
  const {
    data: areaData,
    isFetching: isAreaFetching,
    refetch: refetchArea,
  } = useMapProperties(currentRegion, { enabled: areaSearchEnabled });

  // Use area results when available, otherwise fall back to list results
  const properties =
    areaSearchEnabled && areaData != null ? areaData.items : listProperties;

  const totalCount = areaSearchEnabled && areaData != null
    ? areaData.total
    : (listData?.pages[0]?.total ?? 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setMapRegion(region);
        setCurrentRegion(region);
        setShowSearchThisArea(true);
      }, DEBOUNCE_MS);
    },
    [setMapRegion]
  );

  function handleSearchThisArea() {
    setAreaSearchEnabled(true);
    setShowSearchThisArea(false);
    void refetchArea();
  }

  function handlePinPress(property: PropertySchema) {
    setSelectedProperty(property);
  }

  function handleMapPress() {
    setSelectedProperty(null);
  }

  function handleCountrySelect(code: string) {
    void setCountry(code);
  }

  function handleMapTypeToggle() {
    setMapType((prev) => (prev === 'standard' ? 'satellite' : 'standard'));
  }

  function handleLocateMe(coordinate: { latitude: number; longitude: number }) {
    const region: Region = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    mapRef.current?.animateToRegion(region, 500);
    setMapRegion(region);
    setCurrentRegion(region);
    setShowSearchThisArea(true);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ── Radius badge ───────────────────────────────────────────────────────────
  const radiusText =
    currentRegion != null
      ? `${Math.round(radiusKmFromRegion(currentRegion))} km radius`
      : null;

  return (
    <View style={styles.container} testID="map-screen">
      {/* Full-screen map */}
      <MapViewWrapper
        properties={properties}
        selectedPropertyId={selectedProperty?.id ?? null}
        onPinPress={handlePinPress}
        onMapPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        currency={currency}
        mapRef={mapRef}
      />

      {/* Safe area overlay for controls */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar}>
          {/* Country selector */}
          <CountrySelector
            selectedCode={countryCode}
            onSelect={handleCountrySelect}
          />

          <View style={styles.topBarSpacer} />

          {/* Result count badge */}
          {totalCount > 0 && (
            <View style={styles.countBadge} testID="result-count-badge">
              <Text style={styles.countText}>{totalCount} results</Text>
            </View>
          )}

          {/* List view toggle */}
          <TouchableOpacity
            style={styles.listToggle}
            onPress={() => router.back()}
            accessibilityLabel="List view"
            accessibilityRole="button"
            testID="list-toggle"
          >
            <Text style={styles.listToggleText}>{'☰ List'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search this area — floats below the top bar */}
        {radiusText != null && (
          <Text style={styles.radiusHint} testID="radius-hint">
            {radiusText}
          </Text>
        )}

        <SearchThisAreaButton
          visible={showSearchThisArea}
          loading={isAreaFetching}
          onPress={handleSearchThisArea}
        />
      </SafeAreaView>

      {/* Map controls (floating, outside safe area overlay) */}
      <MapControls
        onLocateMe={handleLocateMe}
        mapType={mapType}
        onMapTypeToggle={handleMapTypeToggle}
        currentCamera={undefined}
      />

      {/* Bottom property card peek */}
      {selectedProperty != null && (
        <View style={styles.bottomCard} testID="bottom-property-card">
          <PropertyCard property={selectedProperty} compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none' as 'box-none',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 8,
    gap: 8,
  },
  topBarSpacer: {
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  listToggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  listToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  radiusHint: {
    alignSelf: 'center',
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 24,
  },
});
