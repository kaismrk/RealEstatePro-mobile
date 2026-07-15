/**
 * i18n core tests (tests 1, 2, 3 of the mobile-p1-i18n PR).
 *
 * 1. t('login.title') returns EN when lang=en, FR when lang=fr
 * 2. detectLanguage() returns 'fr' for TN countryCode with no stored preference
 * 3. SecureStore is written when persistLanguage is called
 */

import i18n from '@/lib/i18n';
import { detectLanguage, persistLanguage, LANG_STORAGE_KEY } from '@/lib/i18n/detect';
import en from '@/lib/i18n/locales/en.json';
import fr from '@/lib/i18n/locales/fr.json';
import ar from '@/lib/i18n/locales/ar.json';

// ── Auth store mock — supports both selector and .getState() ─────────────────

jest.mock('@/lib/stores/auth.store', () => {
  const state = { countryCode: 'TN', setCountry: jest.fn(), accessToken: 'tok' };
  const fn = (selector: (s: typeof state) => unknown) => selector(state);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn as any).getState = () => state;
  return { useAuthStore: fn };
});

// ── SecureStorage mock ───────────────────────────────────────────────────────

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@/lib/utils/secureStorage', () => ({
  secureStorage: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Test 1: Translation values change with language ──────────────────────────

describe('i18n translations', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('t("login.title") returns English value when lang=en', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('login.title')).toBe('Welcome back');
  });

  it('t("login.title") returns French value when lang=fr', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('login.title')).toBe('Bienvenue');
  });

  it('t("settings.header.title") returns Arabic value when lang=ar', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.t('settings.header.title')).toBe('إعدادات التطبيق');
    expect(i18n.t('login.title')).toBe('مرحباً بعودتك');
  });
});

// ── Locale key parity (regression guard for the Arabic translation pass) ─────
//
// Every key in en.json must exist in ar.json (and fr.json) and vice versa.
// i18next plural suffixes (_zero/_one/_two/_few/_many/_other) are normalised
// to a single base key: Arabic legitimately carries more plural forms than
// English, but the base key set must be identical.

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function collectBaseKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      for (const child of collectBaseKeys(value as Record<string, unknown>, path)) {
        keys.add(child);
      }
    } else {
      keys.add(path.replace(PLURAL_SUFFIX, '_plural'));
    }
  }
  return keys;
}

function collectLeafEntries(
  obj: Record<string, unknown>,
  prefix = ''
): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      entries.push(...collectLeafEntries(value as Record<string, unknown>, path));
    } else {
      entries.push([path, String(value)]);
    }
  }
  return entries;
}

describe('locale key parity', () => {
  const enKeys = collectBaseKeys(en as Record<string, unknown>);

  it('ar.json has exactly the same (plural-normalised) key set as en.json', () => {
    const arKeys = collectBaseKeys(ar as Record<string, unknown>);
    expect([...arKeys].sort()).toEqual([...enKeys].sort());
  });

  it('fr.json has exactly the same (plural-normalised) key set as en.json', () => {
    const frKeys = collectBaseKeys(fr as Record<string, unknown>);
    expect([...frKeys].sort()).toEqual([...enKeys].sort());
  });

  it('ar.json has no empty translation values', () => {
    const emptyKeys = collectLeafEntries(ar as Record<string, unknown>)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key);
    expect(emptyKeys).toEqual([]);
  });

  it('ar.json preserves all {{placeholders}} of en.json (non-plural keys)', () => {
    const arEntries = new Map(collectLeafEntries(ar as Record<string, unknown>));
    const mismatches: string[] = [];
    for (const [key, enValue] of collectLeafEntries(en as Record<string, unknown>)) {
      if (PLURAL_SUFFIX.test(key)) continue; // plural forms may drop {{count}}
      const placeholders = enValue.match(/\{\{[^}]+\}\}/g) ?? [];
      const arValue = arEntries.get(key);
      if (arValue === undefined) continue; // covered by the parity test above
      for (const ph of placeholders) {
        if (!arValue.includes(ph)) mismatches.push(`${key}: missing ${ph}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

// ── Test 2: detectLanguage returns 'fr' for TN countryCode ──────────────────

describe('detectLanguage()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);   // no stored preference
    mockSetItem.mockResolvedValue(undefined);
  });

  it('returns "fr" when countryCode is TN and no preference is stored', async () => {
    const lang = await detectLanguage();
    expect(lang).toBe('fr');
  });

  it('returns stored preference when one exists (overrides countryCode)', async () => {
    mockGetItem.mockResolvedValue('en');
    const lang = await detectLanguage();
    expect(lang).toBe('en');
  });
});

// ── Test 3: SecureStore write when persistLanguage is called ─────────────────

describe('persistLanguage()', () => {
  beforeEach(() => {
    mockSetItem.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('writes "fr" to SecureStore under the correct key', async () => {
    await persistLanguage('fr');
    expect(mockSetItem).toHaveBeenCalledWith(LANG_STORAGE_KEY, 'fr');
  });

  it('writes "en" to SecureStore under the correct key', async () => {
    await persistLanguage('en');
    expect(mockSetItem).toHaveBeenCalledWith(LANG_STORAGE_KEY, 'en');
  });
});
