/**
 * Phase F10 — Region breadcrumb display.
 * Shows the selected region path as "Region > Department > City".
 */
import { View, Text } from 'react-native';
import type { Region } from '@/hooks/useRegions';

interface RegionBreadcrumbProps {
  path: Region[];
  className?: string;
}

export function RegionBreadcrumb({ path, className }: RegionBreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <View
      className={`flex-row items-center flex-wrap ${className ?? ''}`}
      accessibilityLabel={`Selected location: ${path.map((r) => r.name).join(', ')}`}
    >
      {path.map((region, index) => (
        <View key={region.id} className="flex-row items-center">
          {index > 0 && (
            <Text className="text-gray-400 mx-1 text-sm">{'\u203A'}</Text>
          )}
          <Text
            className={`text-sm ${
              index === path.length - 1
                ? 'text-primary-500 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {region.name}
          </Text>
        </View>
      ))}
    </View>
  );
}
