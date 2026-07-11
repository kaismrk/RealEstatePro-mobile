import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import type { PropertySchema } from '@/lib/types/property';
import { CurrencyText } from '@/components/ui/CurrencyText';
import { HeartButton } from './HeartButton';
import { BoostBadge } from './BoostBadge';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries } from '@/hooks/useCountries';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';

interface PropertyCardProps {
  property: PropertySchema;
  compact?: boolean;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
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

function statusLabel(status: string): string {
  const map: Record<string, string> = { pending: 'Pending Review', rejected: 'Rejected', not_published: 'Draft' };
  return map[status] ?? status;
}

function statusColors(status: string): { bg: string; text: string } {
  if (status === 'pending')  return { bg: colors.warningBg, text: colors.warning };
  if (status === 'rejected') return { bg: colors.errorBg,   text: colors.error };
  return { bg: colors.neutral100, text: colors.neutral600 };
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { data: countries } = useCountries();

  const images: string[] = property.image_urls ?? [];
  const hasImages = images.length > 0;
  const currency = countries?.find((c) => c.country_code === countryCode)?.currency ?? 'TND';
  const showStatus = property.publish_status != null && property.publish_status !== 'published';
  const imgH = compact ? 160 : 210;

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    if (layoutMeasurement.width > 0) {
      setActiveIndex(Math.round(contentOffset.x / layoutMeasurement.width));
    }
  }

  function renderImg({ item }: ListRenderItemInfo<string>) {
    return (
      <Image
        source={{ uri: item }}
        style={{ width: '100%', height: imgH }}
        resizeMode="cover"
        accessibilityLabel="Property photo"
      />
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      onPress={() => router.push(`/property/${property.id}`)}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.city}`}
    >
      {/* Photo carousel */}
      <View style={{ height: imgH, position: 'relative' }}>
        {hasImages ? (
          <>
            <FlatList<string>
              ref={flatListRef}
              data={images}
              renderItem={renderImg}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            />
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={[{ height: imgH }, styles.noImagePlaceholder]}>
            <Icon name="home" size={40} color={colors.neutral300} />
          </View>
        )}

        {/* Time badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>{timeAgo(property.created_at)}</Text>
        </View>

        {/* Heart button */}
        <View style={styles.heartWrap}>
          <HeartButton propertyId={property.id} />
        </View>

        {/* Boost badge */}
        {property.is_boosted === true && (
          <View style={styles.boostWrap}>
            <BoostBadge />
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.body}>
        {/* Price + status */}
        <View style={styles.priceRow}>
          <CurrencyText
            amount={property.price}
            currency={currency}
            style={styles.price}
          />
          {showStatus && property.publish_status != null && (
            <View style={[styles.statusBadge, { backgroundColor: statusColors(property.publish_status).bg }]}>
              <Text style={[styles.statusText, { color: statusColors(property.publish_status).text }]}>
                {statusLabel(property.publish_status)}
              </Text>
            </View>
          )}
        </View>

        {/* Facts row */}
        <View style={styles.factsRow}>
          {property.bedrooms != null && (
            <View style={styles.factItem}>
              <Icon name="bed" size={14} color={colors.textSecondary} />
              <Text style={styles.factText}>
                {property.bedrooms} {property.bedrooms !== 1 ? 'beds' : 'bed'}
              </Text>
            </View>
          )}
          {property.bathrooms != null && (
            <View style={styles.factItem}>
              <Icon name="bath" size={14} color={colors.textSecondary} />
              <Text style={styles.factText}>
                {property.bathrooms} {property.bathrooms !== 1 ? 'baths' : 'bath'}
              </Text>
            </View>
          )}
          {property.area_sqm != null && (
            <View style={styles.factItem}>
              <Icon name="ruler" size={14} color={colors.textSecondary} />
              <Text style={styles.factText}>{property.area_sqm} m²</Text>
            </View>
          )}
        </View>

        {/* Address */}
        {(property.address || property.city) ? (
          <View style={styles.addressRow}>
            <Icon name="map-pin" size={13} color={colors.textTertiary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {[property.address, property.city].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    borderRadius: 999,
  },
  dotActive:   { width: 8,  height: 8,  backgroundColor: colors.surface },
  dotInactive: { width: 6,  height: 6,  backgroundColor: 'rgba(255,255,255,0.5)' },
  noImagePlaceholder: {
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.photoBadge,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeText: { fontSize: 11, color: colors.textOnBrand, fontWeight: fontWeight.medium },
  heartWrap: { position: 'absolute', top: 8, right: 8 },
  boostWrap: { position: 'absolute', top: 10, left: 52 },
  body: { padding: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: fontWeight.semibold },
  factsRow: { flexDirection: 'row', gap: 14, marginBottom: 6 },
  factItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  factText: { fontSize: 13, color: colors.textSecondary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { fontSize: 13, color: colors.textTertiary, flex: 1 },
});
