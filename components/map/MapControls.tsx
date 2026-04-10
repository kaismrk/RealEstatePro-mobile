import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import type { MapType, Camera } from 'react-native-maps';

interface MapControlsProps {
  onLocateMe: (coordinate: { latitude: number; longitude: number }) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  mapType: MapType;
  onMapTypeToggle: () => void;
  currentCamera?: Camera;
}

export function MapControls({
  onLocateMe,
  mapType,
  onMapTypeToggle,
}: MapControlsProps) {
  async function handleLocateMe() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    onLocateMe({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  const isSatellite = mapType === 'satellite' || mapType === 'hybrid';

  return (
    <View style={styles.container} testID="map-controls">
      {/* Map type toggle */}
      <TouchableOpacity
        style={styles.button}
        onPress={onMapTypeToggle}
        accessibilityLabel={isSatellite ? 'Switch to standard map' : 'Switch to satellite map'}
        accessibilityRole="button"
        testID="map-type-toggle"
      >
        <Text style={styles.icon}>{isSatellite ? '\uD83D\uDDFA\uFE0F' : '\uD83D\uDEF0\uFE0F'}</Text>
      </TouchableOpacity>

      {/* My location */}
      <TouchableOpacity
        style={[styles.button, styles.buttonTop]}
        onPress={() => void handleLocateMe()}
        accessibilityLabel="My location"
        accessibilityRole="button"
        testID="my-location-button"
      >
        <Text style={styles.icon}>{'\uD83D\uDCCD'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 8,
    zIndex: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonTop: {
    marginBottom: 0,
  },
  icon: {
    fontSize: 20,
  },
});
