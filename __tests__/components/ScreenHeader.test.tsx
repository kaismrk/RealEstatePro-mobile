import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    canGoBack: () => mockCanGoBack,
  },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ScreenHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack = true;
  });

  it('renders the title', () => {
    render(<ScreenHeader title="Property Details" />);
    expect(screen.getByText('Property Details')).toBeTruthy();
  });

  it('does not render a back button when back prop is omitted', () => {
    render(<ScreenHeader title="Settings" />);
    const backBtn = screen.queryByRole('button', { name: 'Go back' });
    expect(backBtn).toBeNull();
  });

  it('does not render a back button when back={false}', () => {
    render(<ScreenHeader title="Settings" back={false} />);
    const backBtn = screen.queryByRole('button', { name: 'Go back' });
    expect(backBtn).toBeNull();
  });

  it('renders the back button when back={true}', () => {
    render(<ScreenHeader title="Messages" back />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('calls router.back() when back button is pressed and stack is not empty', () => {
    mockCanGoBack = true;
    render(<ScreenHeader title="Messages" back />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('calls router.replace("/(tabs)/search") when stack is empty (deep-link fallback)', () => {
    mockCanGoBack = false;
    render(<ScreenHeader title="Map" back />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/search');
  });

  it('renders a long title without crashing', () => {
    const longTitle = 'A very long screen title that should still render';
    render(<ScreenHeader title={longTitle} back />);
    expect(screen.getByText(longTitle)).toBeTruthy();
  });
});
