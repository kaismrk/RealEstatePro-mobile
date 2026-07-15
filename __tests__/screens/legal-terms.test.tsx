import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import TermsScreen from '@/app/profile/legal/terms';
import { api } from '@/lib/api/client';
import { markdownToHtml } from '@/components/legal/LegalDocScreen';

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

describe('TermsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: '# Terms\n\nSome terms body.' });
  });

  it('renders the "Terms of Use" title in the header', () => {
    render(<TermsScreen />);
    expect(screen.getByText('Terms of Use')).toBeTruthy();
  });

  it('renders the back button', () => {
    render(<TermsScreen />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('fetches from the backend legal endpoint with lang + country params', async () => {
    render(<TermsScreen />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const [path, config] = mockGet.mock.calls[0] as [string, { params: Record<string, string> }];
    expect(path).toBe('/legal/terms');
    // jest.setup.js forces i18n to 'en'; auth store default country is TN
    expect(config.params['lang']).toBe('en');
    expect(config.params['country']).toBe('TN');
  });

  it('renders the fetched markdown as HTML in the WebView', async () => {
    render(<TermsScreen />);
    const htmlEl = await screen.findByTestId('webview-html');
    expect(String(htmlEl.props.children)).toContain('<h1>Terms</h1>');
    expect(String(htmlEl.props.children)).toContain('<p>Some terms body.</p>');
  });

  it('shows fallback text when the fetch fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'));
    render(<TermsScreen />);
    expect(await screen.findByText(/Loading legal document/)).toBeTruthy();
    expect(screen.getByText(/ensure you are online/)).toBeTruthy();
    expect(screen.queryByTestId('webview-mock')).toBeNull();
  });

  it('back button calls router.back() when stack is not empty', () => {
    render(<TermsScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('markdownToHtml', () => {
  it('converts headings, bold, lists and paragraphs', () => {
    const html = markdownToHtml(
      '# Title\n## Sub\nPlain **bold** text\n- item one\n- item two',
    );
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<h2>Sub</h2>');
    expect(html).toContain('<p>Plain <strong>bold</strong> text</p>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>item one</li>');
    expect(html).toContain('<li>item two</li>');
    expect(html).toContain('</ul>');
  });

  it('escapes raw HTML in the source markdown', () => {
    const html = markdownToHtml('Hello <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
