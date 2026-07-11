/**
 * Tests for the Help & Feedback screen.
 *
 * Test plan:
 *  1. Renders screen title and FAQ section
 *  2. Category picker opens when the category row is pressed
 *  3. Submit button is disabled when required fields are empty
 *  4. Submit calls useSubmitFeedback with the correct payload
 *  5. Success path: calls router.back()
 *  6. Error path: shows inline error message
 *  7. FAQ items expand on tap and collapse on second tap
 */
import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Router mock ────────────────────────────────────────────────────────────
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    push: jest.fn(),
    canGoBack: () => true,
  },
}));

// ── useSubmitFeedback mock ─────────────────────────────────────────────────
const mockMutate = jest.fn();
let mockIsPending = false;

jest.mock('@/lib/api/support', () => ({
  useSubmitFeedback: () => ({
    mutate: (...args: unknown[]) => mockMutate(...args),
    isPending: mockIsPending,
  }),
}));

// ── Theme mock — avoids real SecureStore/Appearance in tests ───────────────
jest.mock('@/lib/theme', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

// ── Import screen ──────────────────────────────────────────────────────────
import HelpScreen from '@/app/profile/help';

// ── Helpers ────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderHelp() {
  return render(
    React.createElement(createWrapper(), null, React.createElement(HelpScreen))
  );
}

function fillForm() {
  // Open picker and select "Bug"
  fireEvent.press(screen.getByTestId('category-picker-trigger'));
  fireEvent.press(screen.getByTestId('category-option-bug'));
  // Fill subject
  fireEvent.changeText(screen.getByTestId('subject-input'), 'App crashes on launch');
  // Fill message
  fireEvent.changeText(screen.getByTestId('message-input'), 'The app closes immediately when I open the property detail page.');
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('HelpScreen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  // Test 1 — renders
  it('renders the Help & Feedback title and FAQ section', () => {
    renderHelp();
    expect(screen.getByText('Help & Feedback')).toBeTruthy();
    expect(screen.getByText('Frequently asked questions')).toBeTruthy();
    // FAQ items are present
    expect(screen.getByText('How do I publish a listing?')).toBeTruthy();
  });

  // Test 2 — category picker
  it('opens the category picker modal when the category row is pressed', () => {
    renderHelp();
    // Picker is closed initially — options are not visible
    expect(screen.queryByTestId('category-option-bug')).toBeNull();
    // Open the picker
    fireEvent.press(screen.getByTestId('category-picker-trigger'));
    // Options are now visible
    expect(screen.getByTestId('category-option-bug')).toBeTruthy();
    expect(screen.getByTestId('category-option-feature')).toBeTruthy();
    expect(screen.getByTestId('category-option-question')).toBeTruthy();
    expect(screen.getByTestId('category-option-other')).toBeTruthy();
  });

  // Test 3 — disabled when empty
  it('submit button does not fire when required fields are empty', () => {
    renderHelp();
    // Press submit without filling any fields
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 4 — correct payload
  it('calls mutation with correct payload when all fields are filled', () => {
    mockMutate.mockImplementation(() => {/* no-op for payload check */});
    renderHelp();
    fillForm();
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(mockMutate).toHaveBeenCalledWith(
      {
        subject: 'App crashes on launch',
        message: 'The app closes immediately when I open the property detail page.',
        category: 'bug',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  // Test 5 — success path navigates back
  it('calls router.back() after successful submission', async () => {
    mockMutate.mockImplementation(
      (_body: unknown, options: { onSuccess: () => void; onError: (e: Error) => void }) => {
        options.onSuccess();
      }
    );
    renderHelp();
    fillForm();
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() => expect(mockRouterBack).toHaveBeenCalledTimes(1));
  });

  // Test 6 — error path shows inline message
  it('shows inline error message when submission fails', async () => {
    mockMutate.mockImplementation(
      (_body: unknown, options: { onSuccess: () => void; onError: (e: Error) => void }) => {
        options.onError(new Error('Network error'));
      }
    );
    renderHelp();
    fillForm();
    fireEvent.press(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByTestId('submit-error')).toBeTruthy()
    );
    expect(screen.getByText('Could not send. Try again later.')).toBeTruthy();
    // router.back should NOT have been called
    expect(mockRouterBack).not.toHaveBeenCalled();
  });

  // Test 7 — FAQ expand/collapse
  it('expands a FAQ item on tap and collapses it on second tap', () => {
    renderHelp();
    // Answer is hidden initially
    expect(screen.queryByTestId('faq-answer-0')).toBeNull();
    // Tap to expand
    fireEvent.press(screen.getByTestId('faq-item-0'));
    expect(screen.getByTestId('faq-answer-0')).toBeTruthy();
    // Tap again to collapse
    fireEvent.press(screen.getByTestId('faq-item-0'));
    expect(screen.queryByTestId('faq-answer-0')).toBeNull();
  });
});
