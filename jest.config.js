'use strict';

// Set EXPO_PUBLIC_* defaults before Babel transforms any module.
// Without these, Babel's inline-env transform creates getters that throw when
// the .env.local file is absent (e.g. CI or fresh clone).
// Using non-empty placeholders so the social-auth feature flags are true in tests
// and the hook logic executes (enabling unit-testing of success/cancel/error paths).
process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID     || 'test-ios-client-id.apps.googleusercontent.com';
process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'test-android-client-id.apps.googleusercontent.com';
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     || 'test-web-client-id.apps.googleusercontent.com';

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter-module.js',
    '^expo/virtual/(.*)$': '<rootDir>/__mocks__/expo-virtual.js',
    // Prevent gorhom/bottom-sheet from loading native reanimated in tests
    '^components/ui/BottomSheet$': '<rootDir>/__mocks__/bottom-sheet-mock.js',
    '^@/components/ui/BottomSheet$': '<rootDir>/__mocks__/bottom-sheet-mock.js',
    '^@gorhom/bottom-sheet$': '<rootDir>/__mocks__/gorhom-bottom-sheet-mock.js',
    // react-native-webview needs a JS mock in the test environment
    '^react-native-webview$': '<rootDir>/__mocks__/react-native-webview.js',
    // expo-video needs a JS mock in the test environment (native module)
    '^expo-video$': '<rootDir>/__mocks__/expo-video.js',
    // expo-localization needs a JS mock in the test environment
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.js',
    // Social auth — these modules require native code; use manual mocks in tests
    '^expo-apple-authentication$': '<rootDir>/__mocks__/expo-apple-authentication.js',
    '^expo-auth-session/providers/google$': '<rootDir>/__mocks__/expo-auth-session-google.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|nativewind|zustand|react-native-webview|i18next|react-i18next|libphonenumber-js|expo-apple-authentication|expo-crypto|expo-auth-session)',
  ],
};
