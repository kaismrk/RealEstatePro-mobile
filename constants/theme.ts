export const colors = {
  // Brand
  primary:      '#5f09fe',   // electric violet
  primaryDark:  '#3a0699',   // deep violet
  primaryLight: '#f3edff',   // tinted backgrounds, selected states
  accent:       '#ee8b60',   // coral — Featured badges, gradient end

  // Surfaces
  surface:      '#ffffff',
  surfaceMuted: '#fafafb',   // scroll backgrounds
  surfaceSunken:'#f5f5f7',  // inputs, quiet chips
  background:   '#fafafb',

  // Foreground (warm neutrals)
  textPrimary:   '#0f0f14',
  textSecondary: '#4a4a55',
  textTertiary:  '#a1a1ac',

  // Border
  border:       '#e7e7ec',
  borderStrong: '#d3d3db',

  // Semantic
  error:   '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  heartRed:'#e53e3e',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;
