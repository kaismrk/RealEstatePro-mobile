import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PrivacyScreen from '@/app/profile/legal/privacy';

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

// react-native-webview is auto-mocked via __mocks__/react-native-webview.js

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PrivacyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the "Privacy Policy" title in the header', () => {
    render(<PrivacyScreen />);
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
  });

  it('renders the back button', () => {
    render(<PrivacyScreen />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('renders the WebView with the correct Privacy URL', () => {
    render(<PrivacyScreen />);
    expect(screen.getByTestId('webview-uri').props.children).toBe(
      'https://admin.hovioo.com/privacy'
    );
  });

  it('shows the WebView by default (no error state)', () => {
    render(<PrivacyScreen />);
    expect(screen.getByTestId('webview-mock')).toBeTruthy();
  });

  it('hides the WebView and shows fallback text after onError', () => {
    const { getByTestId, queryByTestId, getByText } = render(<PrivacyScreen />);

    // Simulate WebView error
    const webviewEl = getByTestId('webview-mock');
    fireEvent(webviewEl, 'error');

    // After error: WebView gone, fallback text present
    expect(queryByTestId('webview-mock')).toBeNull();
    expect(getByText(/Loading legal document/)).toBeTruthy();
    expect(getByText(/ensure you are online/)).toBeTruthy();
  });

  it('back button calls router.back() when stack is not empty', () => {
    render(<PrivacyScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
