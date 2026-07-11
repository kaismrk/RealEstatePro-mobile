/**
 * i18n core tests (tests 1, 2, 3 of the mobile-p1-i18n PR).
 *
 * 1. t('login.title') returns EN when lang=en, FR when lang=fr
 * 2. detectLanguage() returns 'fr' for TN countryCode with no stored preference
 * 3. SecureStore is written when persistLanguage is called
 */

import i18n from '@/lib/i18n';
import { detectLanguage, persistLanguage, LANG_STORAGE_KEY } from '@/lib/i18n/detect';

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
