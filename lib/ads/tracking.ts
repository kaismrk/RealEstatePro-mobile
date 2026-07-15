// lib/ads/tracking.ts
// Fire-and-forget ad event tracking (impressions, clicks, video quartiles).
//
// - One anonymous session UUID per app launch (expo-crypto randomUUID).
// - Per-session dedupe: each (event_type, campaign_id) pair is sent at most
//   once per session (viewable impressions, unique clicks, quartiles-once).
// - Events accumulate in an in-memory queue flushed to POST /ads/events when
//   10 events are pending, on a 15 s timer, or when the app goes to the
//   background. Every network call is silent-catch — ads must never surface
//   errors to the user.

import { AppState, type AppStateStatus } from 'react-native';
import * as Crypto from 'expo-crypto';
import { api } from '@/lib/api/client';
import type { AdEvent, AdEventType } from '@/lib/types/ad';

export type Quartile = 25 | 50 | 75 | 100;

const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 15_000;
const MAX_BATCH = 50; // backend rejects batches > 50

function makeSessionHash(): string {
  try {
    const id = Crypto.randomUUID();
    if (typeof id === 'string' && id.length > 0) return id.slice(0, 36);
  } catch {
    // fall through to the JS fallback
  }
  // RFC4122-ish fallback if the native module is unavailable
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let sessionHash = makeSessionHash();
const sentKeys = new Set<string>();
let queue: AdEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let appStateSubscribed = false;

function ensureAppStateListener(): void {
  if (appStateSubscribed) return;
  appStateSubscribed = true;
  try {
    AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        void flushAdEvents();
      }
    });
  } catch {
    // non-fatal — timer/threshold flushing still applies
  }
}

function enqueue(campaignId: number, eventType: AdEventType): void {
  const key = `${eventType}:${campaignId}`;
  if (sentKeys.has(key)) return;
  sentKeys.add(key);
  queue.push({ campaign_id: campaignId, event_type: eventType });
  ensureAppStateListener();

  if (queue.length >= FLUSH_THRESHOLD) {
    void flushAdEvents();
    return;
  }
  if (flushTimer == null) {
    flushTimer = setTimeout(() => {
      void flushAdEvents();
    }, FLUSH_INTERVAL_MS);
  }
}

/** Viewable impression (≥50% visible for ≥1 s) — once per campaign per session. */
export function trackImpression(campaignId: number): void {
  enqueue(campaignId, 'impression');
}

/** CTA / media tap — once per campaign per session. */
export function trackClick(campaignId: number): void {
  enqueue(campaignId, 'click');
}

/** Video playback quartile (25/50/75/100) — each once per campaign per session. */
export function trackQuartile(campaignId: number, quartile: Quartile): void {
  enqueue(campaignId, `video_q${quartile}` as AdEventType);
}

/** Drain the queue to the backend. Fire-and-forget; never throws. */
export async function flushAdEvents(): Promise<void> {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  while (queue.length > 0) {
    const batch = queue.slice(0, MAX_BATCH);
    queue = queue.slice(batch.length);
    try {
      await api.post('/ads/events', { events: batch, session_hash: sessionHash });
    } catch {
      // silent — drop the batch, ads tracking must never disturb the UX
    }
  }
}

/** The anonymous per-launch session identifier sent with every batch. */
export function getAdSessionHash(): string {
  return sessionHash;
}

/** Test-only: reset queue, dedupe sets, timer, and mint a new session. */
export function __resetAdTrackingForTests(): void {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  queue = [];
  sentKeys.clear();
  sessionHash = makeSessionHash();
}
