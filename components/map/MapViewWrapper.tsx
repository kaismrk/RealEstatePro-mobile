import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import { useSearchStore } from '@/lib/stores/search.store';
import { PricePinMarker } from './PricePinMarker';
import { ClusterPin } from './ClusterPin';
import type { PropertySchema } from '@/lib/types/property';

// Tunisia centroid
const TUNISIA_REGION: Region = {
  latitude: 33.8869,
  longitude: 9.5375,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

/** Grid-bucket clustering — groups properties within 0.05 degrees of each other */
function clusterProperties(
  properties: PropertySchema[],
  latitudeDelta: number
): Array<
  | { type: 'single'; property: PropertySchema }
  | { type: 'cluster'; count: number; latitude: number; longitude: number; key: string }
> {
  // Only cluster when zoomed out enough
  const gridSize = latitudeDelta > 0.5 ? 0.2 : latitudeDelta > 0.1 ? 0.05 : null;

  if (gridSize === null) {
    // Zoomed in — render individual pins
    return properties
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({ type: 'single' as const, property: p }));
  }

  const buckets = new Map<
    string,
    { properties: PropertySchema[]; sumLat: number; sumLng: number }
  >();

  for (const p of properties) {
    if (p.latitude == null || p.longitude == null) continue;
    const bucketLat = Math.round(p.latitude / gridSize) * gridSize;
    const bucketLng = Math.round(p.longitude / gridSize) * gridSize;
    const key = `${bucketLat.toFixed(4)}_${bucketLng.toFixed(4)}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.properties.push(p);
      existing.sumLat += p.latitude;
      existing.sumLng += p.longitude;
    } else {
      buckets.set(key, { properties: [p], sumLat: p.latitude, sumLng: p.longitude });
    }
  }

  const result: Array<
    | { type: 'single'; property: PropertySchema }
    | { type: 'cluster'; count: number; latitude: number; longitude: number; key: string }
  > = [];

  for (const [key, bucket] of buckets) {
    if (bucket.properties.length === 1) {
      result.push({ type: 'single', property: bucket.properties[0]! });
    } else {
      result.push({
        type: 'cluster',
        count: bucket.properties.length,
        latitude: bucket.sumLat / bucket.properties.length,
        longitude: bucket.sumLng / bucket.properties.length,
        key,
      });
    }
  }

  return result;
}

interface MapViewWrapperProps {
  properties: PropertySchema[];
  selectedPropertyId: number | null;
  onPinPress: (property: PropertySchema) => void;
  onMapPress: () => void;
  onRegionChangeComplete: (region: Region) => void;
  currency?: string;
  mapRef?: React.RefObject<MapView | null>;
}

export function MapViewWrapper({
  properties,
  selectedPropertyId,
  onPinPress,
  onMapPress,
  onRegionChangeComplete,
  currency = 'TND',
  mapRef,
}: MapViewWrapperProps) {
  const mapRegion = useSearchStore((s) => s.mapRegion);
  const initialRegion = mapRegion ?? TUNISIA_REGION;

  const currentDelta = mapRegion?.latitudeDelta ?? initialRegion.latitudeDelta;
  const clusters = clusterProperties(properties, currentDelta);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      onRegionChangeComplete(region);
    },
    [onRegionChangeComplete]
  );

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      onPress={onMapPress}
      testID="map-view"
      showsUserLocation
      showsMyLocationButton={false}
    >
      {clusters.map((item) => {
        if (item.type === 'single') {
          return (
            <PricePinMarker
              key={item.property.id}
              property={item.property}
              selected={item.property.id === selectedPropertyId}
              currency={currency}
              onPress={() => onPinPress(item.property)}
            />
          );
        }
        return (
          <ClusterPin
            key={item.key}
            count={item.count}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          />
        );
      })}
    </MapView>
  );
}
