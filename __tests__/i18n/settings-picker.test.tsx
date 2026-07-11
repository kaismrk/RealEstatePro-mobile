/**
 * Test 4: Settings language picker modal snapshot (mobile-p1-i18n PR).
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

// ── Auth store mock ───────────────────────────────────────────────────────────

jest.mock('@/lib/stores/auth.store', () => {
  const state = { countryCode: 'TN', setCountry: jest.fn(), accessToken: 'tok' };
  const fn = (selector: (s: typeof state) => unknown) => selector(state);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn as any).getState = () => state;
  return { useAuthStore: fn };
});

// ── detect.ts mock (avoid SecureStore side effects) ───────────────────────────

jest.mock('@/lib/i18n/detect', () => ({
  persistLanguage: jest.fn().mockResolvedValue(undefined),
  detectLanguage: jest.fn().mockResolvedValue('fr'),
  LANG_STORAGE_KEY: 'hovioo.i18n.lang',
}));

// ── Theme mock — light palette, no SecureStore side-effects in this test ─────

jest.mock('@/lib/theme', () => {
  const { lightPalette } = jest.requireActual('@/constants/theme');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const React = require('react') as any;
  function ThemeProvider({ children }: { children: React.ReactNode }) {
    return children;
  }
  function useTheme() {
    return {
      palette: lightPalette,
      mode: 'system' as const,
      setMode: jest.fn().mockResolvedValue(undefined),
      isDark: false,
    };
  }
  return { ThemeProvider, useTheme, THEME_STORAGE_KEY: 'hovioo.theme.mode' };
});

// ── Shared UI mocks ───────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: { version: '1.0.0' } },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: jest.fn() }),
}));

jest.mock('@/components/shared/CountrySelector', () => ({
  CountrySelector: () => null,
}));

jest.mock('@/components/profile/MenuRow', () => ({
  MenuRow: ({ label }: { label: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactModule = require('react');
    return ReactModule.createElement(Text, null, label);
  },
}));

jest.mock('@/components/ui/Icon', () => ({
  Icon: () => null,
}));

jest.mock('@/hooks/useAuth', () => ({
  useLogout: () => ({ mutate: jest.fn() }),
}));

import SettingsScreen from '@/app/profile/settings';

function renderSettings() {
  return render(
    React.createElement(
      I18nextProvider,
      { i18n },
      React.createElement(SettingsScreen)
    )
  );
}

describe('Settings language picker', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('language option labels exist in i18n resources', () => {
    // Verify the picker strings are correctly defined for EN and FR
    expect(i18n.t('settings.picker.languages.fr')).toBe('Français');
    expect(i18n.t('settings.picker.languages.en')).toBe('English');
  });

  it('matches snapshot of the settings screen', () => {
    const { toJSON } = renderSettings();
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('Settings theme picker', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('theme option labels are correctly defined in EN', () => {
    expect(i18n.t('settings.theme.system')).toBe('System');
    expect(i18n.t('settings.theme.light')).toBe('Light');
    expect(i18n.t('settings.theme.dark')).toBe('Dark');
  });

  it('theme option labels are correctly defined in FR', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('settings.theme.system')).toBe('Système');
    expect(i18n.t('settings.theme.light')).toBe('Clair');
    expect(i18n.t('settings.theme.dark')).toBe('Sombre');
    await i18n.changeLanguage('en');
  });

  it('theme picker title is defined in EN', () => {
    expect(i18n.t('settings.picker.themeTitle')).toBe('Select Theme');
  });
});
