/**
 * Language detection helper for Hovioo mobile.
 *
 * Detection order:
 * 1. User preference stored in SecureStore (key: hovioo.i18n.lang)
 * 2. Auth store countryCode → TN maps to 'fr', all others map to 'en'
 * 3. Device locale via expo-localization (first 2 chars, lowercase)
 * 4. Ultimate fallback: 'en'
 *
 * NOTE: This file must NOT import from lib/i18n/index.ts to avoid circular
 * dependencies. The root _layout.tsx orchestrates: it imports i18n (from
 * index.ts) and detectLanguage (from this file) separately, then calls
 * i18n.changeLanguage() with the detected code.
 */

import { getLocales } from 'expo-localization';
import { secureStorage } from '@/lib/utils/secureStorage';
import { useAuthStore } from '@/lib/stores/auth.store';

export const LANG_STORAGE_KEY = 'hovioo.i18n.lang';

const SUPPORTED_LANGS = ['fr', 'en', 'ar'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isSupportedLang(code: string): code is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(code);
}

/** Persist chosen language to SecureStore for future sessions. */
export async function persistLanguage(lang: string): Promise<void> {
  await secureStorage.setItem(LANG_STORAGE_KEY, lang);
}

/**
 * Detect the best language for the current user and persist it.
 * Returns a SupportedLang code ('fr' | 'en' | 'ar').
 */
export async function detectLanguage(): Promise<SupportedLang> {
  // 1. Stored user preference
  const stored = await secureStorage.getItem(LANG_STORAGE_KEY);
  if (stored && isSupportedLang(stored)) {
    return stored;
  }

  // 2. Auth store countryCode  (TN → fr, else → en)
  const countryCode = useAuthStore.getState().countryCode;
  if (countryCode) {
    const fromCountry: SupportedLang = countryCode.toUpperCase() === 'TN' ? 'fr' : 'en';
    await persistLanguage(fromCountry);
    return fromCountry;
  }

  // 3. Device locale
  try {
    const locales = getLocales();
    if (locales.length > 0) {
      const deviceCode = (locales[0].languageCode ?? '').toLowerCase().slice(0, 2);
      if (isSupportedLang(deviceCode)) {
        await persistLanguage(deviceCode);
        return deviceCode;
      }
    }
  } catch {
    // expo-localization unavailable (test env) — fall through
  }

  // 4. Ultimate fallback
  await persistLanguage('en');
  return 'en';
}
