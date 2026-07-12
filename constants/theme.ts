// Design reference: docs/design/ — Homy design bundle.
// Dark palette values are conservative defaults — the bundle does not define
// dark mode. Spec: background #0F1115, surface #1A1D24, on-surface #F1F3F7,
// primary keeps hue, borders #2A2E38.

import { StyleSheet } from 'react-native';

// ── Palette type (shared shape for light + dark) ───────────────────────────
// Mapped type: same keys as lightPalette but values widened to string so that
// darkPalette can supply different hex values without TS2322 literal errors.
export type Palette = { readonly [K in keyof typeof lightPalette]: string };

// ── Light palette (Homy design bundle) ────────────────────────────────────
export const lightPalette = {
  // Brand gradient: #3a0699 → #5f09fe → #ee8b60
  primary:       '#5f09fe',
  primaryDark:   '#3a0699',
  primaryLight:  '#f3edff',
  primaryMid:    '#4d05d6',
  accent:        '#ee8b60',

  // Surfaces
  surface:       '#ffffff',
  surfaceMuted:  '#fafafb',
  surfaceSunken: '#f5f5f7',

  // Neutrals (warm-leaning)
  neutral50:  '#fafafb',
  neutral100: '#f5f5f7',
  neutral200: '#e7e7ec',
  neutral300: '#d3d3db',
  neutral400: '#a1a1ac',
  neutral500: '#6b6b76',
  neutral600: '#4a4a55',
  neutral700: '#2f2f38',
  neutral800: '#1d1d24',
  neutral900: '#0f0f14',

  // Foreground
  textPrimary:   '#0f0f14',
  textSecondary: '#4a4a55',
  textTertiary:  '#a1a1ac',
  textOnBrand:   '#ffffff',

  // Borders
  border:       '#e7e7ec',
  borderStrong: '#d3d3db',
  borderBrand:  '#c8a9ff',

  // Background
  background: '#fafafb',

  // Semantic
  error:      '#dc2626',
  errorBg:    '#fef2f2',
  success:    '#16a34a',
  successBg:  '#ecfdf3',
  warning:    '#f59e0b',
  warningBg:  '#fff7ed',
  info:       '#3b82f6',
  infoBg:     '#eef4ff',
  heartRed:   '#e53e3e',

  // Overlays
  overlayScrim: 'rgba(15,15,20,0.55)',
  photoBadge:   'rgba(0,0,0,0.4)',
  heartBg:      'rgba(255,255,255,0.85)',

  // Extended semantic tokens (not in Homy bundle — conservative additions)
  warningText:  '#92400e',  // amber-800 — text inside warning banners
  errorBorder:  '#fecaca',  // red-200 — light red border on error states
  accentBg:     '#fdf0e8',  // warm tint — accent-variant badge background

  // Primary scale deep end — used for cost segment in loan breakdown bar
  // Maps to CSS var(--primary-900) in the Homy design system (#1c0250)
  primary900:   '#1c0250',
} as const;

// ── Dark palette (conservative defaults — not in Homy bundle) ─────────────
export const darkPalette: Palette = {
  // Brand — primary hue unchanged per spec
  primary:       '#5f09fe',
  primaryDark:   '#3a0699',
  primaryLight:  '#1c0547',
  primaryMid:    '#4d05d6',
  accent:        '#ee8b60',

  // Surfaces (dark spec)
  surface:       '#1A1D24',
  surfaceMuted:  '#1F2330',
  surfaceSunken: '#15171D',

  // Neutrals (inverted scale)
  neutral50:  '#1A1D24',
  neutral100: '#1F2330',
  neutral200: '#2A2E38',
  neutral300: '#3A3F50',
  neutral400: '#6B7280',
  neutral500: '#9CA3AF',
  neutral600: '#C1C7D4',
  neutral700: '#DDE3EE',
  neutral800: '#EEF2F8',
  neutral900: '#F8FAFF',

  // Foreground (on-surface per spec)
  textPrimary:   '#F1F3F7',
  textSecondary: '#A0A8B8',
  textTertiary:  '#6B7280',
  textOnBrand:   '#FFFFFF',

  // Borders (per spec)
  border:       '#2A2E38',
  borderStrong: '#3A3F50',
  borderBrand:  '#7C5FE8',

  // Background (per spec)
  background: '#0F1115',

  // Semantic
  error:      '#f87171',
  errorBg:    '#2d0d0d',
  success:    '#34d399',
  successBg:  '#052e16',
  warning:    '#fbbf24',
  warningBg:  '#292108',
  info:       '#60a5fa',
  infoBg:     '#0d1f3c',
  heartRed:   '#f87171',

  // Overlays
  overlayScrim: 'rgba(0,0,0,0.7)',
  photoBadge:   'rgba(0,0,0,0.55)',
  heartBg:      'rgba(15,15,20,0.85)',

  // Extended semantic tokens
  warningText:  '#fcd34d',  // amber-300 — readable on dark backgrounds
  errorBorder:  '#7f1d1d',  // red-900 — dark red border on dark surfaces
  accentBg:     '#2d1a0e',  // warm dark — accent-variant badge background

  // Primary scale deep end — dark variant of primary900 (slightly lighter for visibility)
  primary900:   '#3a0699',
} as const;

// ── Backward-compat alias — light palette (all existing imports continue to work)
export const colors = lightPalette;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  // aliases kept for back-compat
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  xs:   6,
  sm:   10,
  md:   12,
  lg:   16,
  xl:   20,
  xl2:  24,
  pill: 999,
} as const;

export const fontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  // aliases kept for back-compat
  md:  16,
  xxl: 32,
} as const;

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  xs: {
    shadowColor: '#0f0f14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0f0f14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0f0f14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  brand: {
    shadowColor: '#5f09fe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// Reusable layout helpers (plain objects, not StyleSheet — used inline)
export const layout = {
  flex1:      { flex: 1 as const },
  row:        { flexDirection: 'row' as const },
  col:        { flexDirection: 'column' as const },
  center:     { alignItems: 'center' as const, justifyContent: 'center' as const },
  rowCenter:  { flexDirection: 'row' as const, alignItems: 'center' as const },
  rowBetween: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  rowEnd:     { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'flex-end' as const },
  grow:       { flexGrow: 1 as const },
  wrap:       { flexWrap: 'wrap' as const },
  abs:        { position: 'absolute' as const },
  absInset:   { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 },
  overflow:   { overflow: 'hidden' as const },
  selfStart:  { alignSelf: 'flex-start' as const },
  selfCenter: { alignSelf: 'center' as const },
};

// iOS safe area top constant
export const SAFE_TOP = 54;
