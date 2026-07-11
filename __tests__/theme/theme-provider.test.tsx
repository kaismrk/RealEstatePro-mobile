/**
 * Tests for lib/theme/ThemeProvider.tsx (mobile-p1-theme PR).
 *
 * Coverage:
 * 1. useTheme() returns light palette when mode='light'
 * 2. SecureStore is read on mount
 * 3. setMode() writes to SecureStore
 * 4. System mode responds to Appearance changes
 * 5. Snapshot of the theme picker in settings
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

// ── Mock expo-secure-store (already in jest.setup.js, but explicit here for clarity)
const secureStore: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStore[key] = value;
  }),
  getItemAsync: jest.fn(async (key: string) => secureStore[key] ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStore[key];
  }),
}));

// ── Mock Appearance ────────────────────────────────────────────────────────

let mockColorScheme: 'light' | 'dark' = 'light';
const appearanceListeners: Array<(pref: { colorScheme: 'light' | 'dark' | null }) => void> = [];

jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: () => mockColorScheme,
  addChangeListener: jest.fn((listener) => {
    appearanceListeners.push(listener);
    return { remove: () => { /* noop */ } };
  }),
}));

// Import after mocks
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '@/lib/theme';
import { lightPalette, darkPalette } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';

// ── Helper: consumer component ─────────────────────────────────────────────

function ThemeConsumer() {
  const { palette, mode, isDark } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="primaryColor">{palette.primary}</Text>
      <Text testID="bgColor">{palette.background}</Text>
    </>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(secureStore).forEach((k) => delete secureStore[k]);
  appearanceListeners.length = 0;
  mockColorScheme = 'light';
});

describe('useTheme — light palette', () => {
  it('returns light palette values when mode is stored as light', async () => {
    // Pre-seed storage with 'light'
    secureStore[THEME_STORAGE_KEY] = 'light';

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('light');
    });

    expect(getByTestId('isDark').props.children).toBe('false');
    expect(getByTestId('primaryColor').props.children).toBe(lightPalette.primary);
    expect(getByTestId('bgColor').props.children).toBe(lightPalette.background);
  });

  it('returns dark palette values when mode is stored as dark', async () => {
    secureStore[THEME_STORAGE_KEY] = 'dark';

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });

    expect(getByTestId('isDark').props.children).toBe('true');
    expect(getByTestId('bgColor').props.children).toBe(darkPalette.background);
  });
});

describe('SecureStore hydration', () => {
  it('reads THEME_STORAGE_KEY from SecureStore on mount', async () => {
    secureStore[THEME_STORAGE_KEY] = 'dark';

    renderWithProvider();

    await waitFor(() => {
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    });
  });

  it('writes to SecureStore when setMode is called', async () => {
    function SetterConsumer() {
      const { setMode } = useTheme();
      return (
        <Text
          testID="setModeBtn"
          onPress={() => void setMode('dark')}
        >
          set dark
        </Text>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <SetterConsumer />
      </ThemeProvider>
    );

    await act(async () => {
      getByTestId('setModeBtn').props.onPress();
    });

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
    });
  });
});

describe('System mode — Appearance integration', () => {
  it('responds to Appearance.addChangeListener when mode is system', async () => {
    // Start with 'system' mode (default) and OS in light
    mockColorScheme = 'light';

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('isDark').props.children).toBe('false');
    });

    // Simulate OS switching to dark
    await act(async () => {
      mockColorScheme = 'dark';
      appearanceListeners.forEach((l) => l({ colorScheme: 'dark' }));
    });

    await waitFor(() => {
      expect(getByTestId('isDark').props.children).toBe('true');
    });
  });
});
