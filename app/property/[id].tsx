import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItemInfo,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { CurrencyText } from '@/components/ui/CurrencyText';
import { BoostBadge } from '@/components/property/BoostBadge';
import { HeartButton } from '@/components/property/HeartButton';
import { PublishStatusBadge } from '@/components/property/PublishStatusBadge';
import { WhatsSpecialTags } from '@/components/property/WhatsSpecialTags';
import { FactsGrid } from '@/components/property/FactsGrid';
import { FactsAndFeatures } from '@/components/property/FactsAndFeatures';
import { MortgageCalculator } from '@/components/property/MortgageCalculator';
import { AgentCard } from '@/components/property/AgentCard';
import { NearbyHomesRow } from '@/components/property/NearbyHomesRow';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries } from '@/hooks/useCountries';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const flatListRef = useRef<FlatList<string>>(null);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { data: countries } = useCountries();

  const currency =
    countries?.find((c) => c.country_code === countryCode)?.currency ?? 'TND';

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    if (width > 0) setActiveImageIndex(Math.round(offsetX / width));
  }

  function renderImageItem({ item }: ListRenderItemInfo<string>) {
    return (
      <Image
        source={{ uri: item }}
        className="h-72 w-full"
        resizeMode="cover"
        accessibilityLabel="Property photo"
      />
    );
  }

  async function handleShare() {
    if (!property) return;
    try {
      await Share.share({ message: `${property.title} — ${property.city}` });
    } catch {
      // Share cancelled or failed — silent
    }
  }

  function handleOpenGallery() {
    router.push(`/property/${id}/gallery`);
  }

  function handleContact() {
    router.push(`/property/${id}/contact`);
  }

  function handleRequestTour() {
    router.push(`/property/${id}/contact`);
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl mb-4">🏠</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2">Property not found</Text>
        <Text className="text-gray-500 text-center mb-6">
          This listing may no longer be available.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images: string[] = property.image_urls ?? [];
  const hasImages = images.length > 0;

  const showStatusBadge =
    property.publish_status != null && property.publish_status !== 'published';

  const descriptionText = property.description ?? '';
  const descriptionLong = descriptionText.length > 200;
  const descriptionDisplay = descriptionLong && !descriptionExpanded
    ? descriptionText.slice(0, 200) + '…'
    : descriptionText;

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 1. Photo Carousel */}
        <TouchableOpacity activeOpacity={0.95} onPress={handleOpenGallery}>
          <View className="relative h-72 bg-gray-200">
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
                {images.length > 1 && (
                  <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
                    {images.map((_, i) => (
                      <View
                        key={i}
                        className={`rounded-full ${i === activeImageIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`}
                      />
                    ))}
                  </View>
                )}
                {images.length > 1 && (
                  <View className="absolute bottom-3 right-3 bg-black/50 rounded-full px-2 py-0.5">
                    <Text className="text-white text-xs">
                      {activeImageIndex + 1}/{images.length}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View className="h-72 items-center justify-center bg-gray-200">
                <Text className="text-6xl">🏠</Text>
              </View>
            )}

            {/* Back button */}
            <TouchableOpacity
              className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 items-center justify-center"
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text className="text-white text-base">‹</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View className="px-4 pt-4">
          {/* 2. Publish Status Badge */}
          {showStatusBadge && property.publish_status && (
            <View className="mb-3">
              <PublishStatusBadge status={property.publish_status} />
            </View>
          )}

          {/* 3. Price Header */}
          <View className="flex-row items-center justify-between mb-1">
            <CurrencyText
              amount={property.price}
              currency={currency}
              className="text-2xl font-bold text-gray-900"
            />
            {property.is_boosted && (
              <BoostBadge />
            )}
          </View>

          {/* 4. Key Stats Row */}
          <View className="flex-row items-center gap-4 mb-2">
            {property.bedrooms != null && (
              <View className="flex-row items-center gap-1">
                <Text className="text-base">🛏</Text>
                <Text className="text-sm text-gray-700">
                  {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View className="flex-row items-center gap-1">
                <Text className="text-base">🛁</Text>
                <Text className="text-sm text-gray-700">
                  {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {property.area_sqm != null && (
              <View className="flex-row items-center gap-1">
                <Text className="text-base">📐</Text>
                <Text className="text-sm text-gray-700">{property.area_sqm} m²</Text>
              </View>
            )}
          </View>

          {/* 5. Address */}
          {(property.address || property.city) && (
            <View className="flex-row items-center gap-1 mb-3">
              <Text className="text-base">📍</Text>
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {[property.address, property.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {/* 6. Heart + Share Row */}
          <View className="flex-row items-center justify-between border-y border-gray-100 py-3 mb-4">
            <Text className="text-base font-semibold text-gray-900">{property.title}</Text>
            <View className="flex-row items-center gap-3">
              <HeartButton propertyId={property.id} />
              <TouchableOpacity
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Share property"
              >
                <Text className="text-xl">📤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 7. What's Special Tags */}
          <WhatsSpecialTags property={property} />

          {/* 8. Description */}
          {descriptionText.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">Description</Text>
              <Text className="text-sm text-gray-700 leading-6">{descriptionDisplay}</Text>
              {descriptionLong && (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded((v) => !v)}
                  accessibilityRole="button"
                >
                  <Text className="text-blue-600 text-sm mt-1 font-medium">
                    {descriptionExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 9. Quick Facts Grid */}
          <FactsGrid property={property} />

          {/* 10. Facts & Features Accordion */}
          <FactsAndFeatures property={property} />

          {/* 11. Mortgage Calculator */}
          <MortgageCalculator price={property.price} />

          {/* 12. Agent Card */}
          {property.agency_id != null && (
            <AgentCard
              agentId={property.agency_id}
              agencyId={property.agency_id}
              propertyId={property.id}
            />
          )}

          {/* 13. Nearby Homes */}
          {property.latitude != null && property.longitude != null && (
            <NearbyHomesRow
              lat={property.latitude}
              lng={property.longitude}
              excludeId={property.id}
            />
          )}

          {/* Bottom spacing for sticky bar */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* 14. Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex-row gap-3">
        <TouchableOpacity
          className="flex-1 border border-blue-600 rounded-xl py-3.5 items-center"
          onPress={handleContact}
          accessibilityRole="button"
          accessibilityLabel="Contact agent"
        >
          <Text className="text-blue-600 font-semibold">Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-xl py-3.5 items-center"
          onPress={handleRequestTour}
          accessibilityRole="button"
          accessibilityLabel="Request a tour"
        >
          <Text className="text-white font-semibold">Request Tour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
