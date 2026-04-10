import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { formatPrice } from '@/lib/utils/currency';
import type { PropertySchema } from '@/lib/types/property';

interface PricePinMarkerProps {
  property: PropertySchema;
  selected?: boolean;
  onPress?: () => void;
  currency?: string;
}

export function PricePinMarker({
  property,
  selected = false,
  onPress,
  currency = 'TND',
}: PricePinMarkerProps) {
  if (property.latitude == null || property.longitude == null) return null;

  const formattedPrice = formatPrice(property.price, currency);

  const isBoosted = property.is_boosted === true;

  return (
    <Marker
      coordinate={{
        latitude: property.latitude,
        longitude: property.longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false}
      testID={`price-pin-${property.id}`}
    >
      <View
        testID="price-pin-container"
        style={{
          paddingHorizontal: selected ? 12 : 8,
          paddingVertical: selected ? 7 : 5,
          borderRadius: 20,
          backgroundColor: selected ? '#2563EB' : '#FFFFFF',
          borderWidth: isBoosted ? 2 : 1,
          borderColor: isBoosted ? '#F59E0B' : selected ? '#2563EB' : '#D1D5DB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.25 : 0.15,
          shadowRadius: selected ? 4 : 2,
          elevation: selected ? 6 : 3,
        }}
      >
        <Text
          testID="price-pin-text"
          style={{
            fontSize: selected ? 14 : 12,
            fontWeight: '700',
            color: selected ? '#FFFFFF' : '#111827',
          }}
          numberOfLines={1}
        >
          {formattedPrice}
        </Text>
      </View>
    </Marker>
  );
}
