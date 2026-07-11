/**
 * Web fallback for MapViewWrapper.
 *
 * react-native-maps relies on native modules that are not available in the
 * browser.  On web we render an informational banner instead of crashing.
 */
import { View, Text, StyleSheet } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';
import type { Region } from 'react-native-maps';
import { colors } from '@/constants/theme';

interface MapViewWrapperProps {
  properties: PropertySchema[];
  selectedPropertyId: number | null;
  onPinPress: (property: PropertySchema) => void;
  onMapPress: () => void;
  onRegionChangeComplete: (region: Region) => void;
  currency?: string;
  // mapRef is intentionally omitted — no MapView instance on web
  mapRef?: unknown;
}

export function MapViewWrapper(_props: MapViewWrapperProps) {
  return (
    <View style={styles.container} testID="map-view-web-fallback">
      <Text style={styles.icon}>🗺</Text>
      <Text style={styles.title}>Map view not available on web</Text>
      <Text style={styles.subtitle}>
        Use the list view to browse properties on desktop or mobile browser.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
    padding: 32,
    gap: 12,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
