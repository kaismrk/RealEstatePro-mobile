/**
 * Tests for lib/ads/tracking.ts — session-scoped dedupe, batching, timer
 * flush, and silent error handling.
 */

const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

import {
  trackImpression,
  trackClick,
  trackQuartile,
  flushAdEvents,
  getAdSessionHash,
  __resetAdTrackingForTests,
} from '@/lib/ads/tracking';

interface EventsBody {
  events: { campaign_id: number; event_type: string }[];
  session_hash: string;
}

function postedBody(callIndex = 0): EventsBody {
  return mockApiPost.mock.calls[callIndex][1] as EventsBody;
}

describe('ad tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ status: 202, data: { accepted: 0 } });
    __resetAdTrackingForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dedupes impressions per campaign per session', async () => {
    trackImpression(1);
    trackImpression(1);
    trackImpression(1);
    trackImpression(2);
    await flushAdEvents();

    expect(mockApiPost).toHaveBeenCalledTimes(1);
    const body = postedBody();
    expect(body.events).toEqual([
      { campaign_id: 1, event_type: 'impression' },
      { campaign_id: 2, event_type: 'impression' },
    ]);
  });

  it('emits each video quartile only once per campaign per session', async () => {
    trackQuartile(5, 25);
    trackQuartile(5, 25);
    trackQuartile(5, 50);
    trackQuartile(5, 50);
    trackQuartile(5, 100);
    await flushAdEvents();

    const body = postedBody();
    expect(body.events).toEqual([
      { campaign_id: 5, event_type: 'video_q25' },
      { campaign_id: 5, event_type: 'video_q50' },
      { campaign_id: 5, event_type: 'video_q100' },
    ]);
  });

  it('dedupes clicks but keeps them independent from impressions', async () => {
    trackImpression(7);
    trackClick(7);
    trackClick(7);
    await flushAdEvents();

    const body = postedBody();
    expect(body.events).toEqual([
      { campaign_id: 7, event_type: 'impression' },
      { campaign_id: 7, event_type: 'click' },
    ]);
  });

  it('auto-flushes once 10 events accumulate', async () => {
    for (let i = 1; i <= 10; i += 1) trackImpression(i);
    // flush is fire-and-forget — let the microtask run
    await Promise.resolve();
    expect(mockApiPost).toHaveBeenCalledTimes(1);
    expect(postedBody().events).toHaveLength(10);
  });

  it('flushes pending events on the 15s timer', async () => {
    jest.useFakeTimers();
    trackImpression(1);
    expect(mockApiPost).not.toHaveBeenCalled();

    jest.advanceTimersByTime(15_000);
    await Promise.resolve();

    expect(mockApiPost).toHaveBeenCalledTimes(1);
    expect(postedBody().events).toEqual([{ campaign_id: 1, event_type: 'impression' }]);
  });

  it('sends a stable session_hash (≤36 chars) with every batch', async () => {
    const hash = getAdSessionHash();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash.length).toBeLessThanOrEqual(36);

    trackImpression(1);
    await flushAdEvents();
    trackImpression(2);
    await flushAdEvents();

    expect(postedBody(0).session_hash).toBe(hash);
    expect(postedBody(1).session_hash).toBe(hash);
  });

  it('mints a new session hash after reset (new session = fresh dedupe)', async () => {
    const first = getAdSessionHash();
    trackImpression(1);
    await flushAdEvents();

    __resetAdTrackingForTests();
    expect(getAdSessionHash()).not.toBe(first);

    // Same campaign can be tracked again in the new session
    trackImpression(1);
    await flushAdEvents();
    expect(mockApiPost).toHaveBeenCalledTimes(2);
  });

  it('swallows network errors silently (fire-and-forget)', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('network down'));
    trackImpression(1);
    await expect(flushAdEvents()).resolves.toBeUndefined();
  });

  it('does not call the API when there is nothing to flush', async () => {
    await flushAdEvents();
    expect(mockApiPost).not.toHaveBeenCalled();
  });
});
