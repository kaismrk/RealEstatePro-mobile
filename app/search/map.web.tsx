/**
 * Web fallback for the map search screen.
 *
 * react-native-maps does not support web (React Native Web).  This file is
 * automatically picked up by Metro bundler when building for the web platform
 * (it takes precedence over map.tsx on web).
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function MapScreenWeb() {
  return (
    <View style={styles.container} testID="map-screen-web">
      <Text style={styles.icon}>🗺</Text>
      <Text style={styles.title}>Map view not available on web</Text>
      <Text style={styles.subtitle}>
        Map view requires the native iOS or Android app.{'\n'}
        Use the list view to browse and filter properties on web.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go to list view"
      >
        <Text style={styles.buttonText}>Back to list view</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
    gap: 16,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#5f09fe',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
