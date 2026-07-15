/**
 * AdCard — sponsored image/video card interleaved in the search feed.
 *
 * Visual conventions mirror PropertyCard (same width, margins, radius,
 * border, shadow, 210 px media area). Always shows the mandatory
 * "Sponsored" chip (i18n `search.ad.sponsored`) + advertiser name.
 *
 * CTA dispatch (tap on button OR on the media itself):
 *   web      → expo-web-browser in-app browser
 *   whatsapp → wa.me deep link (accepts raw phone or full URL)
 *   phone    → tel: link
 *   internal → expo-router push (e.g. /loans?rate=7.9&bank=BIAT)
 * Every CTA tap also fires a click tracking event (deduped per session).
 *
 * Video ads: expo-video, muted + looping, poster (thumbnail_url) shown until
 * playback starts. `isVisible` (driven by the FlatList viewability of the
 * search screen) plays/pauses the player. Quartile events (25/50/75/100)
 * are emitted once per campaign per session from the playback position.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTheme } from '@/lib/theme';
import type { Palette } from '@/constants/theme';
import { radius, fontWeight, shadows } from '@/constants/theme';
import type { AdPublic } from '@/lib/types/ad';
import { trackClick, trackQuartile } from '@/lib/ads/tracking';

const MEDIA_HEIGHT = 210; // same aspect as PropertyCard's image area

interface AdCardProps {
  ad: AdPublic;
  /** ≥50% viewable for ≥1s in the feed — drives video play/pause. */
  isVisible?: boolean;
}

/** Prefix backend-relative media paths (e.g. /uploads/ads/…) with the API origin. */
function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === '') return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiUrl = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1';
  const origin = apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Dispatch the ad's CTA and fire a click event. Exported for tests. */
export async function openAdCta(ad: AdPublic): Promise<void> {
  if (ad.cta_action == null || ad.cta_value == null || ad.cta_value === '') return;
  trackClick(ad.id);
  try {
    switch (ad.cta_action) {
      case 'web':
        await WebBrowser.openBrowserAsync(ad.cta_value);
        break;
      case 'whatsapp': {
        const url = ad.cta_value.startsWith('http')
          ? ad.cta_value
          : `https://wa.me/${ad.cta_value.replace(/\D/g, '')}`;
        await Linking.openURL(url);
        break;
      }
      case 'phone':
        await Linking.openURL(`tel:${ad.cta_value}`);
        break;
      case 'internal':
        router.push(ad.cta_value as never);
        break;
    }
  } catch {
    // silent — a failing CTA must not crash the feed
  }
}

// ── Video media ──────────────────────────────────────────────────────────────

function AdVideo({ ad, isVisible }: { ad: AdPublic; isVisible: boolean }) {
  const mediaUrl = resolveMediaUrl(ad.media_url) ?? '';
  const posterUrl = resolveMediaUrl(ad.thumbnail_url);
  const [showPoster, setShowPoster] = useState(posterUrl != null);

  const player = useVideoPlayer(mediaUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.5;
  });

  // Viewability-driven autoplay (muted) / pause off-screen
  useEffect(() => {
    try {
      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
    } catch {
      // player may already be released
    }
  }, [isVisible, player]);

  // Hide the poster once playback actually starts
  useEffect(() => {
    const sub = player.addListener('playingChange', (payload: { isPlaying: boolean }) => {
      if (payload.isPlaying) setShowPoster(false);
    });
    return () => sub.remove();
  }, [player]);

  // Quartile tracking from the playback position (deduped per session)
  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', (payload: { currentTime: number }) => {
      const duration = player.duration;
      if (typeof duration !== 'number' || duration <= 0 || payload.currentTime <= 0) return;
      const pct = payload.currentTime / duration;
      if (pct >= 0.25) trackQuartile(ad.id, 25);
      if (pct >= 0.5) trackQuartile(ad.id, 50);
      if (pct >= 0.75) trackQuartile(ad.id, 75);
    });
    const endSub = player.addListener('playToEnd', () => {
      trackQuartile(ad.id, 100);
    });
    return () => {
      timeSub.remove();
      endSub.remove();
    };
  }, [player, ad.id]);

  return (
    <View style={{ height: MEDIA_HEIGHT }}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        testID={`ad-video-${ad.id}`}
      />
      {showPoster && posterUrl != null && (
        <Image
          source={{ uri: posterUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel="Ad video poster"
        />
      )}
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function AdCard({ ad, isVisible = false }: AdCardProps) {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const s = useMemo(() => makeStyles(palette), [palette]);

  const hasCta = ad.cta_label != null && ad.cta_label !== ''
    && ad.cta_action != null
    && ad.cta_value != null && ad.cta_value !== '';
  const imageUrl = resolveMediaUrl(ad.media_url);

  function handlePress(): void {
    void openAdCta(ad);
  }

  return (
    <View style={[s.card, shadows.sm]} testID={`ad-card-${ad.id}`}>
      {/* Media area — tapping it triggers the same CTA */}
      <TouchableOpacity
        activeOpacity={0.95}
        disabled={!hasCta}
        onPress={handlePress}
        accessibilityRole={hasCta ? 'button' : undefined}
        accessibilityLabel={`${t('search.ad.sponsored')}, ${ad.advertiser_name}`}
        testID={`ad-media-${ad.id}`}
      >
        <View style={s.mediaWrap}>
          {ad.media_type === 'video' ? (
            <AdVideo ad={ad} isVisible={isVisible} />
          ) : imageUrl != null ? (
            <Image
              source={{ uri: imageUrl }}
              style={s.mediaImage}
              resizeMode="cover"
              accessibilityLabel="Sponsored content"
            />
          ) : (
            <View style={s.mediaPlaceholder} />
          )}

          {/* Mandatory sponsored chip */}
          <View style={s.sponsoredChip} testID={`ad-sponsored-${ad.id}`}>
            <Text style={s.sponsoredText}>{t('search.ad.sponsored')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Body */}
      <View style={s.body}>
        <Text style={s.advertiser} numberOfLines={1}>
          {ad.advertiser_name}
        </Text>
        {ad.title != null && ad.title !== '' && (
          <Text style={s.title} numberOfLines={2}>
            {ad.title}
          </Text>
        )}
        {ad.body != null && ad.body !== '' && (
          <Text style={s.bodyText} numberOfLines={3}>
            {ad.body}
          </Text>
        )}
        {hasCta && (
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={handlePress}
            accessibilityRole="button"
            testID={`ad-cta-${ad.id}`}
          >
            <Text style={s.ctaText}>{ad.cta_label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    // Same footprint as PropertyCard
    card: {
      backgroundColor: palette.surface,
      borderRadius: radius.xl,
      overflow: 'hidden',
      marginBottom: 16,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: palette.border,
    },
    mediaWrap: {
      height: MEDIA_HEIGHT,
      position: 'relative',
      backgroundColor: palette.neutral100,
    },
    mediaImage: {
      width: '100%',
      height: MEDIA_HEIGHT,
    },
    mediaPlaceholder: {
      height: MEDIA_HEIGHT,
      backgroundColor: palette.neutral100,
    },
    // Same placement/shape as PropertyCard's time badge
    sponsoredChip: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: palette.photoBadge,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    sponsoredText: {
      fontSize: 11,
      color: palette.textOnBrand,
      fontWeight: fontWeight.semibold,
    },
    body: {
      padding: 14,
      gap: 6,
    },
    advertiser: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      color: palette.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.04 * 12,
    },
    title: {
      fontSize: 16,
      fontWeight: fontWeight.bold,
      color: palette.textPrimary,
    },
    bodyText: {
      fontSize: 13,
      color: palette.textSecondary,
      lineHeight: 18,
    },
    ctaBtn: {
      marginTop: 6,
      backgroundColor: palette.primary,
      borderRadius: radius.sm,
      paddingVertical: 11,
      alignItems: 'center',
    },
    ctaText: {
      fontSize: 14,
      fontWeight: fontWeight.semibold,
      color: palette.textOnBrand,
    },
  });
}
