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
