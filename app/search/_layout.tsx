import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="filters"
        options={{ presentation: 'modal', title: 'Filters' }}
      />
      <Stack.Screen name="map" options={{ title: 'Map View' }} />
    </Stack>
  );
}
