// lib/ads/interleave.ts
// Pure utility that merges sponsored ads into the property feed.
//
// Placement rules (server-driven via /ads/serve settings):
//   - the first ad appears AFTER `first_position` property cards (default 3)
//   - each subsequent ad appears after every `interval` further property
//     cards (default 7)
//   - ads are consumed in array order (backend sorts by display_order) and
//     cycle when the feed is longer than the ad batch
//   - an empty ads array returns the property feed untouched

import type { AdPublic, AdSettings } from '@/lib/types/ad';
import { DEFAULT_AD_SETTINGS } from '@/lib/types/ad';

export type FeedItem<P> =
  | { kind: 'property'; item: P }
  | { kind: 'ad'; ad: AdPublic };

/** Clamp a server-provided setting to a sane positive integer. */
function sanitize(value: number | undefined | null, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

export function interleave<P>(
  properties: readonly P[],
  ads: readonly AdPublic[],
  settings?: Partial<AdSettings> | null
): FeedItem<P>[] {
  if (ads.length === 0) {
    return properties.map((item) => ({ kind: 'property' as const, item }));
  }

  const firstPosition = sanitize(settings?.first_position, DEFAULT_AD_SETTINGS.first_position);
  const interval = sanitize(settings?.interval, DEFAULT_AD_SETTINGS.interval);

  const out: FeedItem<P>[] = [];
  let adIndex = 0;
  let sinceLastAd = 0;
  let nextThreshold = firstPosition;

  for (const item of properties) {
    out.push({ kind: 'property', item });
    sinceLastAd += 1;
    if (sinceLastAd === nextThreshold) {
      // Cycle through the batch in display_order.
      const ad = ads[adIndex % ads.length];
      if (ad !== undefined) out.push({ kind: 'ad', ad });
      adIndex += 1;
      sinceLastAd = 0;
      nextThreshold = interval;
    }
  }

  return out;
}
