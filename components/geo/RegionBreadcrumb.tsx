/**
 * Phase F10 — Region breadcrumb display.
 * Shows the selected region path as "Region > Department > City".
 */
import { View, Text, StyleSheet } from 'react-native';
import type { Region } from '@/hooks/useRegions';
import { colors, fontWeight } from '@/constants/theme';

interface RegionBreadcrumbProps {
  path: Region[];
  style?: object;
}

export function RegionBreadcrumb({ path, style }: RegionBreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`Selected location: ${path.map((r) => r.name).join(', ')}`}
    >
      {path.map((region, index) => (
        <View key={region.id} style={styles.segment}>
          {index > 0 && (
            <Text style={styles.separator}>{'›'}</Text>
          )}
          <Text
            style={index === path.length - 1 ? styles.activeText : styles.inactiveText}
          >
            {region.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    color: colors.textTertiary,
    marginHorizontal: 4,
    fontSize: 14,
  },
  activeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  inactiveText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});
