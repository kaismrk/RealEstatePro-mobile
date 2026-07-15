/**
 * Exhaustive unit tests for lib/ads/interleave.ts — the pure feed-merging
 * util that positions sponsored ads between property cards using the
 * server-driven { first_position, interval } settings.
 */

import { interleave, type FeedItem } from '@/lib/ads/interleave';
import type { AdPublic } from '@/lib/types/ad';

function makeAd(id: number): AdPublic {
  return {
    id,
    media_type: 'image',
    media_url: `/uploads/ads/${id}/creative.jpg`,
    thumbnail_url: null,
    title: `Ad ${id}`,
    body: null,
    cta_label: 'Learn more',
    cta_action: 'web',
    cta_value: 'https://example.tn',
    advertiser_name: `Advertiser ${id}`,
  };
}

function makeProps(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/** Positions (indices) of ad items in the merged feed. */
function adPositions(feed: FeedItem<number>[]): number[] {
  return feed.reduce<number[]>((acc, item, i) => {
    if (item.kind === 'ad') acc.push(i);
    return acc;
  }, []);
}

function adIds(feed: FeedItem<number>[]): number[] {
  return feed.filter((f): f is { kind: 'ad'; ad: AdPublic } => f.kind === 'ad').map((f) => f.ad.id);
}

function propertyValues(feed: FeedItem<number>[]): number[] {
  return feed
    .filter((f): f is { kind: 'property'; item: number } => f.kind === 'property')
    .map((f) => f.item);
}

const DEFAULTS = { first_position: 3, interval: 7 };

describe('interleave', () => {
  it('returns properties unchanged (no ad items) when ads array is empty', () => {
    const feed = interleave(makeProps(10), [], DEFAULTS);
    expect(feed).toHaveLength(10);
    expect(adPositions(feed)).toEqual([]);
    expect(propertyValues(feed)).toEqual(makeProps(10));
  });

  it('returns an empty feed for empty properties (even with ads available)', () => {
    expect(interleave([], [makeAd(1)], DEFAULTS)).toEqual([]);
  });

  it('places the first ad after first_position property cards (defaults 3/7)', () => {
    const feed = interleave(makeProps(10), [makeAd(1)], DEFAULTS);
    // p1 p2 p3 AD p4..p10 AD → ad indices 3 and 11
    expect(adPositions(feed)).toEqual([3, 11]);
    expect(feed).toHaveLength(12);
    expect(propertyValues(feed)).toEqual(makeProps(10));
  });

  it('inserts subsequent ads after every `interval` further property cards', () => {
    const feed = interleave(makeProps(20), [makeAd(1), makeAd(2), makeAd(3)], DEFAULTS);
    // slots after property #3, #10, #17
    expect(adPositions(feed)).toEqual([3, 11, 19]);
    expect(adIds(feed)).toEqual([1, 2, 3]); // consumed in array order
  });

  it('cycles through the ad batch when the feed is longer than the batch', () => {
    const feed = interleave(makeProps(31), [makeAd(1), makeAd(2)], DEFAULTS);
    // slots after property #3, #10, #17, #24, #31
    expect(adIds(feed)).toEqual([1, 2, 1, 2, 1]);
  });

  it('a single ad repeats at every slot (cycling with batch of 1)', () => {
    const feed = interleave(makeProps(17), [makeAd(9)], DEFAULTS);
    expect(adIds(feed)).toEqual([9, 9, 9]);
  });

  it('inserts no ad when the list is shorter than first_position', () => {
    const feed = interleave(makeProps(2), [makeAd(1)], DEFAULTS);
    expect(adPositions(feed)).toEqual([]);
    expect(feed).toHaveLength(2);
  });

  it('appends an ad at the end when the list length exactly hits a slot', () => {
    const feed = interleave(makeProps(3), [makeAd(1)], DEFAULTS);
    expect(adPositions(feed)).toEqual([3]);
    expect(feed).toHaveLength(4);
  });

  it('honours custom settings (first_position=1, interval=3)', () => {
    const feed = interleave(makeProps(8), [makeAd(1), makeAd(2)], {
      first_position: 1,
      interval: 3,
    });
    // slots after property #1, #4, #7
    expect(adPositions(feed)).toEqual([1, 5, 9]);
    expect(adIds(feed)).toEqual([1, 2, 1]);
  });

  it('falls back to defaults (3/7) when settings are missing', () => {
    const noSettings = interleave(makeProps(10), [makeAd(1)]);
    const nullSettings = interleave(makeProps(10), [makeAd(1)], null);
    const emptySettings = interleave(makeProps(10), [makeAd(1)], {});
    expect(adPositions(noSettings)).toEqual([3, 11]);
    expect(adPositions(nullSettings)).toEqual([3, 11]);
    expect(adPositions(emptySettings)).toEqual([3, 11]);
  });

  it('falls back to defaults for invalid settings values (0, negative, NaN)', () => {
    const feed = interleave(makeProps(10), [makeAd(1)], { first_position: 0, interval: -2 });
    expect(adPositions(feed)).toEqual([3, 11]);
    const nanFeed = interleave(makeProps(10), [makeAd(1)], {
      first_position: Number.NaN,
      interval: Number.POSITIVE_INFINITY,
    });
    expect(adPositions(nanFeed)).toEqual([3, 11]);
  });

  it('preserves property order and count regardless of ad insertion', () => {
    const feed = interleave(makeProps(25), [makeAd(1), makeAd(2)], DEFAULTS);
    expect(propertyValues(feed)).toEqual(makeProps(25));
  });
});
