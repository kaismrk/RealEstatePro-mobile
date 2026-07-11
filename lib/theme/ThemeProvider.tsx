/**
 * ThemeProvider — light / dark / system theme for Hovioo mobile.
 *
 * Provides:
 *   { palette, mode, setMode, isDark }
 *
 * Persistence key: 'hovioo.theme.mode' in SecureStore.
 * When mode === 'system', tracks Appearance.getColorScheme() live.
 *
 * Pattern mirrors auth.store.ts: starts with safe defaults, rehydrates
 * from SecureStore on mount, never blocks first render.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { lightPalette, darkPalette, type Palette } from '@/constants/theme';
import { secureStorage } from '@/lib/utils/secureStorage';

// ── Types ──────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'hovioo.theme.mode';

interface ThemeContextValue {
  palette: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'system' — matches OS on first render, updated after hydration
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Track live OS color scheme for 'system' mode
  const [systemIsDark, setSystemIsDark] = useState<boolean>(
    Appearance.getColorScheme() === 'dark'
  );

  const listenerRef = useRef<ReturnType<typeof Appearance.addChangeListener> | null>(null);

  // Rehydrate stored preference from SecureStore on mount
  useEffect(() => {
    void (async () => {
      const stored = await secureStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    })();
  }, []);

  // Subscribe / unsubscribe to Appearance changes based on mode
  useEffect(() => {
    if (mode === 'system') {
      // Sync immediately in case OS changed while app was suspended
      setSystemIsDark(Appearance.getColorScheme() === 'dark');

      listenerRef.current = Appearance.addChangeListener(({ colorScheme }) => {
        setSystemIsDark(colorScheme === 'dark');
      });
    } else {
      listenerRef.current?.remove();
      listenerRef.current = null;
    }

    return () => {
      listenerRef.current?.remove();
      listenerRef.current = null;
    };
  }, [mode]);

  /** Persist new mode to SecureStore and update state. */
  const setMode = useCallback(async (newMode: ThemeMode): Promise<void> => {
    setModeState(newMode);
    await secureStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  const isDark: boolean =
    mode === 'dark' || (mode === 'system' && systemIsDark);

  const palette: Palette = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ palette, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * useTheme — access the active palette, current mode, and mode setter.
 *
 * Usage:
 *   const { palette, mode, setMode, isDark } = useTheme();
 *   style={{ color: palette.textPrimary }}
 *
 * To add a new theme later: add a third palette object (e.g. `highContrastPalette`)
 * with the same Palette shape, extend ThemeMode union, and map it here.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
