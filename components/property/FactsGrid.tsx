import { View, Text } from 'react-native';
import type { PropertySchema } from '@/lib/types/property';

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
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">Quick Facts</Text>
      <View className="flex-row flex-wrap">
        {visibleItems.map((item) => (
          <View key={item.label} className="w-1/2 mb-3 pr-2">
            <View className="bg-gray-50 rounded-xl p-3">
              <Text className="text-xs text-gray-500 mb-0.5">{item.label}</Text>
              <Text className="text-sm font-semibold text-gray-900">{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
