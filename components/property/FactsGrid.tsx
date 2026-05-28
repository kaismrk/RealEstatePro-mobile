import { View, Text, StyleSheet } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';
import { colors, radius, fontWeight } from '@/constants/theme';

interface FactsGridProps {
  property: PropertySchema;
}

interface GridItem {
  label: string;
  value: string | null;
}

function formatPropertyType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function computePricePerSqm(price: number, areaSqm: number | null): string | null {
  if (!areaSqm || areaSqm === 0) return null;
  const perSqm = Math.round(price / areaSqm);
  return perSqm.toLocaleString();
}

export function FactsGrid({ property }: FactsGridProps) {
  const items: GridItem[] = [
    {
      label: 'Property Type',
      value: formatPropertyType(property.property_type),
    },
    {
      label: 'Year Built',
      value: property.year_of_construction != null ? String(property.year_of_construction) : null,
    },
    {
      label: 'Floor',
      value:
        property.floor != null
          ? property.num_floors != null
            ? `${property.floor} / ${property.num_floors}`
            : String(property.floor)
          : null,
    },
    {
      label: 'Lot Size',
      value:
        property.land_plot_size_sqm != null
          ? `${property.land_plot_size_sqm} m²`
          : null,
    },
    {
      label: 'Price / m²',
      value:
        property.area_sqm != null
          ? computePricePerSqm(property.price, property.area_sqm)
          : null,
    },
    {
      label: 'Energy Rating',
      value: property.energy_rating ?? null,
    },
  ];

  const visibleItems = items.filter((item) => item.value != null);
  if (visibleItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Facts</Text>
      <View style={styles.grid}>
        {visibleItems.map((item) => (
          <View key={item.label} style={styles.cell}>
            <View style={styles.cellInner}>
              <Text style={styles.cellLabel}>{item.label}</Text>
              <Text style={styles.cellValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  cellInner: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: 12,
  },
  cellLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
