'use strict';

// Mock expo-secure-store for tests
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    setItemAsync: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key) => {
      delete store[key];
    }),
  };
});

// Initialise i18next with English so all screens that use t() render their
// English strings in tests, preserving existing test assertions.
const i18n = require('./lib/i18n').default;
if (!i18n.isInitialized) {
  // init() was already called synchronously in lib/i18n/index.ts; just ensure
  // the language is set to 'en' for a consistent test baseline.
  void i18n.changeLanguage('en');
}
