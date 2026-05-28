import { StyleSheet } from 'react-native';

export const colors = {
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
} as const;

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
