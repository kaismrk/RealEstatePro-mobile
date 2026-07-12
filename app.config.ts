import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamic app config. Extends the static app.json base so static values stay in
 * version control without any env-var references, while build-time secrets are
 * injected here via EXPO_PUBLIC_* env vars.
 *
 * Expo CLI merges config → app.json automatically when this file is present.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  // Spread everything from app.json; override what we need dynamically.
  // Cast required because config.name and config.slug are string | undefined in
  // the ConfigContext type but are always set in our app.json.
  ...(config as ExpoConfig),

  plugins: [
    // Preserve existing plugins from app.json
    ...(Array.isArray(config.plugins) ? (config.plugins as string[]) : []),
    // Sign in with Apple — enables the Apple Sign In capability in the iOS entitlements
    'expo-apple-authentication',
  ],

  extra: {
    ...config.extra,
    // Google OAuth client IDs — public identifiers, safe to bundle but kept in
    // .env.local so the repo can be cloned without them and the feature-flag
    // (FEATURE_SOCIAL_AUTH_GOOGLE) will simply hide the Google button.
    googleIosClientId:     process.env['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID']     ?? '',
    googleAndroidClientId: process.env['EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'] ?? '',
    googleWebClientId:     process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID']     ?? '',
  },
});
