import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import type { PropertySchema } from '@/lib/types/property';
import { CurrencyText } from '@/components/ui/CurrencyText';
import { HeartButton } from './HeartButton';
import { BoostBadge } from './BoostBadge';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries } from '@/hooks/useCountries';

interface PropertyCardProps {
  property: PropertySchema;
  compact?: boolean;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

function publishStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    case 'not_published':
      return 'Draft';
    default:
      return status;
  }
}

function publishStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { data: countries } = useCountries();

  const images: string[] = property.image_urls ?? [];
  const hasImages = images.length > 0;

  const currency =
    countries?.find((c) => c.country_code === countryCode)?.currency ?? 'TND';

  const showStatusBadge =
    property.publish_status != null && property.publish_status !== 'published';

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    if (width > 0) {
      setActiveIndex(Math.round(offsetX / width));
    }
  }

  function renderImageItem({ item }: ListRenderItemInfo<string>) {
    return (
      <Image
        source={{ uri: item }}
        className={`${compact ? 'h-40' : 'h-52'} w-full`}
        resizeMode="cover"
        accessibilityLabel="Property photo"
      />
    );
  }

  function handleCardPress() {
    router.push(`/property/${property.id}`);
  }

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mb-4 mx-4 shadow-sm border border-gray-100"
      onPress={handleCardPress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.city}`}
    >
      {/* Photo carousel */}
      <View className={`relative ${compact ? 'h-40' : 'h-52'}`}>
        {hasImages ? (
          <>
            <FlatList<string>
              ref={flatListRef}
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            />
            {/* Dot indicators */}
            {images.length > 1 && (
              <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1">
                {images.map((_, i) => (
                  <View
                    key={i}
                    className={`rounded-full ${i === activeIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          // Placeholder when no images
          <View className={`${compact ? 'h-40' : 'h-52'} bg-gray-200 items-center justify-center`}>
            <Text className="text-4xl">🏠</Text>
          </View>
        )}

        {/* Top-left: time badge */}
        <View className="absolute top-2 left-2 bg-black/40 rounded-full px-2 py-0.5">
          <Text className="text-xs text-white font-medium">
            {timeAgo(property.created_at)}
          </Text>
        </View>

        {/* Top-right: heart button */}
        <View className="absolute top-2 right-2">
          <HeartButton propertyId={property.id} />
        </View>

        {/* Boost badge */}
        {property.is_boosted === true && (
          <View className="absolute top-2 left-12">
            <BoostBadge />
          </View>
        )}
      </View>

      {/* Card body */}
      <View className="p-3">
        {/* Price row */}
        <View className="flex-row items-center justify-between mb-1">
          <CurrencyText
            amount={property.price}
            currency={currency}
            className="text-xl font-bold text-gray-900"
          />
          {showStatusBadge && property.publish_status != null && (
            <View className={`rounded-full px-2 py-0.5 ${publishStatusColor(property.publish_status)}`}>
              <Text className="text-xs font-semibold">
                {publishStatusLabel(property.publish_status)}
              </Text>
            </View>
          )}
        </View>

        {/* Beds / baths / area row */}
        <View className="flex-row items-center gap-3 mb-1">
          {property.bedrooms != null && (
            <Text className="text-sm text-gray-600">
              {'\uD83D\uDECF'} {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
            </Text>
          )}
          {property.bathrooms != null && (
            <Text className="text-sm text-gray-600">
              {'\uD83D\uDEBF'} {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
            </Text>
          )}
          {property.area_sqm != null && (
            <Text className="text-sm text-gray-600">
              {'\uD83D\uDCCF'} {property.area_sqm} m²
            </Text>
          )}
        </View>

        {/* Address */}
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {[property.address, property.city].filter(Boolean).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
