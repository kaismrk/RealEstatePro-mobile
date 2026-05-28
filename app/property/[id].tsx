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
  StyleSheet,
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
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries } from '@/hooks/useCountries';
import { colors, radius, fontWeight, fontSize, shadows } from '@/constants/theme';

const IMAGE_HEIGHT = 288;

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
        style={styles.carouselImage}
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !property) {
    return (
      <View style={[styles.centered, styles.centeredPadded]}>
        <Icon name="home" size={48} color={colors.textTertiary} />
        <Text style={styles.notFoundTitle}>Property not found</Text>
        <Text style={styles.notFoundSubtitle}>
          This listing may no longer be available.
        </Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackBtnText}>Go Back</Text>
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
    <View style={styles.flex1}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 1. Photo Carousel */}
        <TouchableOpacity activeOpacity={0.95} onPress={handleOpenGallery}>
          <View style={styles.carouselContainer}>
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
                  style={styles.flex1}
                />
                {images.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {images.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          i === activeImageIndex ? styles.dotActive : styles.dotInactive,
                        ]}
                      />
                    ))}
                  </View>
                )}
                {images.length > 1 && (
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {activeImageIndex + 1}/{images.length}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="home" size={64} color={colors.textTertiary} />
              </View>
            )}

            {/* Back button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="chevron-left" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.contentPadding}>
          {/* 2. Publish Status Badge */}
          {showStatusBadge && property.publish_status && (
            <View style={styles.statusBadgeWrapper}>
              <PublishStatusBadge status={property.publish_status} />
            </View>
          )}

          {/* 3. Price Header */}
          <View style={styles.priceRow}>
            <CurrencyText
              amount={property.price}
              currency={currency}
              style={styles.priceText}
            />
            {property.is_boosted && <BoostBadge />}
          </View>

          {/* 4. Key Stats Row */}
          <View style={styles.statsRow}>
            {property.bedrooms != null && (
              <View style={styles.statItem}>
                <Icon name="bed" size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>
                  {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View style={styles.statItem}>
                <Icon name="bath" size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>
                  {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {property.area_sqm != null && (
              <View style={styles.statItem}>
                <Icon name="ruler" size={16} color={colors.textSecondary} />
                <Text style={styles.statText}>{property.area_sqm} m²</Text>
              </View>
            )}
          </View>

          {/* 5. Address */}
          {(property.address || property.city) && (
            <View style={styles.addressRow}>
              <Icon name="map-pin" size={14} color={colors.textTertiary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {[property.address, property.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {/* 6. Title + Heart + Share Row */}
          <View style={styles.titleRow}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.titleActions}>
              <HeartButton propertyId={property.id} />
              <TouchableOpacity
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Share property"
              >
                <Icon name="share" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 7. What's Special Tags */}
          <WhatsSpecialTags property={property} />

          {/* 8. Description */}
          {descriptionText.length > 0 && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{descriptionDisplay}</Text>
              {descriptionLong && (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded((v) => !v)}
                  accessibilityRole="button"
                >
                  <Text style={styles.readMoreText}>
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
          <View style={styles.stickyBarSpacer} />
        </View>
      </ScrollView>

      {/* 14. Sticky Bottom Bar */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={handleContact}
          accessibilityRole="button"
          accessibilityLabel="Contact agent"
        >
          <Text style={styles.contactBtnText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tourBtn}
          onPress={handleRequestTour}
          accessibilityRole="button"
          accessibilityLabel="Request a tour"
        >
          <Text style={styles.tourBtnText}>Request Tour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  centeredPadded: {
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
  carouselContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.borderStrong,
  },
  carouselImage: {
    height: IMAGE_HEIGHT,
    width: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    borderRadius: radius.pill,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: colors.surface,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  imageCounterText: {
    color: colors.surface,
    fontSize: fontSize.xs,
  },
  imagePlaceholder: {
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderStrong,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusBadgeWrapper: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceText: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    marginBottom: 16,
  },
  propertyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  readMoreText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginTop: 4,
  },
  stickyBarSpacer: {
    height: 96,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactBtnText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  tourBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tourBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
});
