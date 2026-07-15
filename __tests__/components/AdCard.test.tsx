/**
 * Tests for components/ads/AdCard.tsx.
 *
 *  - mandatory sponsored label + advertiser name
 *  - each CTA kind dispatches correctly (web / whatsapp / phone / internal)
 *    and ALSO fires a click tracking event
 *  - tapping the media area = same as the CTA button
 *  - no CTA button when CTA fields are absent
 *  - video ads: viewability drives play/pause; quartiles fire from playback
 */

import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

// ── expo-router mock ────────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args), replace: jest.fn(), back: jest.fn() },
}));

// ── expo-web-browser mock ───────────────────────────────────────────────────
const mockOpenBrowser = jest.fn().mockResolvedValue({ type: 'dismiss' });
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowser(...args),
}));

// ── Theme mock (same pattern as loans.test.tsx) ─────────────────────────────
jest.mock('@/lib/theme', () => {
  const { lightPalette } = jest.requireActual('@/constants/theme');
  return {
    useTheme: () => ({ palette: lightPalette, mode: 'light', setMode: jest.fn(), isDark: false }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    THEME_STORAGE_KEY: 'hovioo.theme.mode',
  };
});

// ── Tracking mock ───────────────────────────────────────────────────────────
const mockTrackClick = jest.fn();
const mockTrackQuartile = jest.fn();
jest.mock('@/lib/ads/tracking', () => ({
  trackClick: (...args: unknown[]) => mockTrackClick(...args),
  trackQuartile: (...args: unknown[]) => mockTrackQuartile(...args),
  trackImpression: jest.fn(),
}));

import { AdCard } from '@/components/ads/AdCard';
import type { AdPublic } from '@/lib/types/ad';

// expo-video is mocked via jest.config.js moduleNameMapper
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __getLastMockPlayer } = require('expo-video');

function makeAd(overrides: Partial<AdPublic> = {}): AdPublic {
  return {
    id: 12,
    media_type: 'image',
    media_url: 'https://cdn.example.tn/creative.jpg',
    thumbnail_url: null,
    title: '0% intro rate',
    body: 'Limited time offer',
    cta_label: 'Learn more',
    cta_action: 'web',
    cta_value: 'https://bank.tn',
    advertiser_name: 'Best Bank',
    ...overrides,
  };
}

describe('AdCard', () => {
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
  });

  afterEach(() => {
    openURLSpy.mockRestore();
  });

  it('renders the mandatory sponsored label and the advertiser name', () => {
    render(<AdCard ad={makeAd()} />);
    expect(screen.getByText('Sponsored')).toBeTruthy();
    expect(screen.getByText('Best Bank')).toBeTruthy();
    expect(screen.getByText('0% intro rate')).toBeTruthy();
    expect(screen.getByText('Limited time offer')).toBeTruthy();
  });

  it('renders no CTA button when CTA fields are absent', () => {
    render(<AdCard ad={makeAd({ cta_label: null, cta_action: null, cta_value: null })} />);
    expect(screen.queryByTestId('ad-cta-12')).toBeNull();
    expect(screen.getByText('Sponsored')).toBeTruthy();
  });

  it('web CTA opens the in-app browser and fires a click event', async () => {
    render(<AdCard ad={makeAd()} />);
    fireEvent.press(screen.getByTestId('ad-cta-12'));

    await waitFor(() => expect(mockOpenBrowser).toHaveBeenCalledWith('https://bank.tn'));
    expect(mockTrackClick).toHaveBeenCalledWith(12);
  });

  it('whatsapp CTA builds a wa.me link from a raw phone number', async () => {
    render(
      <AdCard ad={makeAd({ cta_action: 'whatsapp', cta_value: '+216 12 345 678' })} />
    );
    fireEvent.press(screen.getByTestId('ad-cta-12'));

    await waitFor(() =>
      expect(openURLSpy).toHaveBeenCalledWith('https://wa.me/21612345678')
    );
    expect(mockTrackClick).toHaveBeenCalledWith(12);
  });

  it('whatsapp CTA passes a full URL through untouched', async () => {
    render(
      <AdCard ad={makeAd({ cta_action: 'whatsapp', cta_value: 'https://wa.me/21698765432' })} />
    );
    fireEvent.press(screen.getByTestId('ad-cta-12'));

    await waitFor(() =>
      expect(openURLSpy).toHaveBeenCalledWith('https://wa.me/21698765432')
    );
  });

  it('phone CTA opens a tel: link and fires a click event', async () => {
    render(<AdCard ad={makeAd({ cta_action: 'phone', cta_value: '+21671123456' })} />);
    fireEvent.press(screen.getByTestId('ad-cta-12'));

    await waitFor(() => expect(openURLSpy).toHaveBeenCalledWith('tel:+21671123456'));
    expect(mockTrackClick).toHaveBeenCalledWith(12);
  });

  it('internal CTA pushes the route (loan simulator prefill) and fires a click', async () => {
    render(
      <AdCard ad={makeAd({ cta_action: 'internal', cta_value: '/loans?rate=7.9&bank=BIAT' })} />
    );
    fireEvent.press(screen.getByTestId('ad-cta-12'));

    await waitFor(() =>
      expect(mockRouterPush).toHaveBeenCalledWith('/loans?rate=7.9&bank=BIAT')
    );
    expect(mockTrackClick).toHaveBeenCalledWith(12);
  });

  it('tapping the media area triggers the same CTA as the button', async () => {
    render(<AdCard ad={makeAd()} />);
    fireEvent.press(screen.getByTestId('ad-media-12'));

    await waitFor(() => expect(mockOpenBrowser).toHaveBeenCalledWith('https://bank.tn'));
    expect(mockTrackClick).toHaveBeenCalledWith(12);
  });

  describe('video ads', () => {
    function makeVideoAd(): AdPublic {
      return makeAd({
        media_type: 'video',
        media_url: 'https://cdn.example.tn/spot.mp4',
        thumbnail_url: 'https://cdn.example.tn/poster.jpg',
      });
    }

    it('configures the player muted + looping and plays only when visible', () => {
      const { rerender } = render(<AdCard ad={makeVideoAd()} isVisible={false} />);
      const player = __getLastMockPlayer();

      expect(player.muted).toBe(true);
      expect(player.loop).toBe(true);
      expect(player.play).not.toHaveBeenCalled();
      expect(player.pause).toHaveBeenCalled(); // paused while off-screen

      rerender(<AdCard ad={makeVideoAd()} isVisible={true} />);
      expect(player.play).toHaveBeenCalled();

      rerender(<AdCard ad={makeVideoAd()} isVisible={false} />);
      expect(player.pause).toHaveBeenCalledTimes(2);
    });

    it('emits quartile events from the playback position', () => {
      render(<AdCard ad={makeVideoAd()} isVisible={true} />);
      const player = __getLastMockPlayer();
      player.duration = 10;

      player.emit('timeUpdate', { currentTime: 2.6 }); // 26% → q25
      expect(mockTrackQuartile).toHaveBeenCalledWith(12, 25);
      expect(mockTrackQuartile).not.toHaveBeenCalledWith(12, 50);

      player.emit('timeUpdate', { currentTime: 7.6 }); // 76% → q25+q50+q75
      expect(mockTrackQuartile).toHaveBeenCalledWith(12, 50);
      expect(mockTrackQuartile).toHaveBeenCalledWith(12, 75);

      player.emit('playToEnd', undefined); // 100%
      expect(mockTrackQuartile).toHaveBeenCalledWith(12, 100);
    });
  });
});
