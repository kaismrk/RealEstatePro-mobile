'use strict';

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
    // expo-localization needs a JS mock in the test environment
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|nativewind|zustand|react-native-webview|i18next|react-i18next|libphonenumber-js)',
  ],
};
