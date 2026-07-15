import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PrivacyScreen from '@/app/profile/legal/privacy';
import { api } from '@/lib/api/client';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    canGoBack: () => true,
  },
}));

jest.mock('@/lib/api/client', () => ({
  api: { get: jest.fn() },
}));

jest.mock('@/lib/theme', () => {
  const { lightPalette } = jest.requireActual('@/constants/theme');
  return {
    useTheme: () => ({
      palette: lightPalette,
      mode: 'light',
      setMode: jest.fn(),
      isDark: false,
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    THEME_STORAGE_KEY: 'hovioo.theme.mode',
  };
});

const mockGet = api.get as jest.Mock;

// react-native-webview is auto-mocked via __mocks__/react-native-webview.js

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PrivacyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: '# Privacy\n\nYour data matters.' });
  });

  it('renders the "Privacy Policy" title in the header', () => {
    render(<PrivacyScreen />);
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
  });

  it('renders the back button', () => {
    render(<PrivacyScreen />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('fetches from the backend legal endpoint with lang + country params', async () => {
    render(<PrivacyScreen />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const [path, config] = mockGet.mock.calls[0] as [string, { params: Record<string, string> }];
    expect(path).toBe('/legal/privacy');
    expect(config.params['lang']).toBe('en');
    expect(config.params['country']).toBe('TN');
  });

  it('renders the fetched markdown as HTML in the WebView', async () => {
    render(<PrivacyScreen />);
    const htmlEl = await screen.findByTestId('webview-html');
    expect(String(htmlEl.props.children)).toContain('<h1>Privacy</h1>');
    expect(String(htmlEl.props.children)).toContain('<p>Your data matters.</p>');
  });

  it('shows fallback text when the fetch fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'));
    render(<PrivacyScreen />);
    expect(await screen.findByText(/Loading legal document/)).toBeTruthy();
    expect(screen.queryByTestId('webview-mock')).toBeNull();
  });

  it('back button calls router.back() when stack is not empty', () => {
    render(<PrivacyScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
