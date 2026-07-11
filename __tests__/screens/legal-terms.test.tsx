import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TermsScreen from '@/app/profile/legal/terms';

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

describe('TermsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the "Terms of Use" title in the header', () => {
    render(<TermsScreen />);
    expect(screen.getByText('Terms of Use')).toBeTruthy();
  });

  it('renders the back button', () => {
    render(<TermsScreen />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('renders the WebView with the correct Terms URL', () => {
    render(<TermsScreen />);
    expect(screen.getByTestId('webview-uri').props.children).toBe(
      'https://admin.hovioo.com/terms'
    );
  });

  it('shows the WebView by default (no error state)', () => {
    render(<TermsScreen />);
    expect(screen.getByTestId('webview-mock')).toBeTruthy();
  });

  it('hides the WebView and shows fallback text after onError', () => {
    const { getByTestId, queryByTestId, getByText } = render(<TermsScreen />);

    // Simulate WebView error — find the WebView and fire its onError prop
    const webviewEl = getByTestId('webview-mock');
    // React Testing Library fires props via the component tree
    // We reach into the rendered instance to call the onError prop
    fireEvent(webviewEl, 'error');

    // After error: WebView gone, fallback text present
    expect(queryByTestId('webview-mock')).toBeNull();
    expect(getByText(/Loading legal document/)).toBeTruthy();
    expect(getByText(/ensure you are online/)).toBeTruthy();
  });

  it('back button calls router.back() when stack is not empty', () => {
    render(<TermsScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
