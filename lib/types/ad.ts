// lib/types/ad.ts
// Types for the in-feed ads feature (Phase C — mobile).
// Mirrors the backend contract: GET /api/v1/ads/serve + POST /api/v1/ads/events.

export type AdMediaType = 'image' | 'video';
export type AdCtaAction = 'web' | 'whatsapp' | 'phone' | 'internal';

export interface AdPublic {
  id: number;
  media_type: AdMediaType;
  media_url: string;
  thumbnail_url: string | null;
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_action: AdCtaAction | null;
  cta_value: string | null;
  advertiser_name: string;
}

export interface AdSettings {
  /** Number of property cards before the first ad. */
  first_position: number;
  /** Number of property cards between subsequent ads. */
  interval: number;
}

export interface AdServeResponse {
  settings: AdSettings;
  ads: AdPublic[];
}

export type AdEventType =
  | 'impression'
  | 'click'
  | 'video_q25'
  | 'video_q50'
  | 'video_q75'
  | 'video_q100';

export interface AdEvent {
  campaign_id: number;
  event_type: AdEventType;
}

/** Server-side fallback values (backend also defaults to 3 / 7). */
export const DEFAULT_AD_SETTINGS: AdSettings = { first_position: 3, interval: 7 };
