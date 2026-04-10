import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Expo-router mock
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    back: (...args: unknown[]) => mockRouterBack(...args),
  },
  usePathname: () => '/onboarding/step-1',
  // Stack mock: just render children via a fragment
  Stack: () => null,
}));

// Haptics mock
jest.mock('@/lib/utils/haptics', () => ({
  haptic: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// Mutable onboarding draft
let mockOnboardingDraft: Record<string, unknown> = {};
const mockSetOnboardingDraft = jest.fn((partial: Record<string, unknown>) => {
  mockOnboardingDraft = { ...mockOnboardingDraft, ...partial };
});
const mockClearOnboardingDraft = jest.fn(() => {
  mockOnboardingDraft = {};
});

jest.mock('@/lib/stores/ui.store', () => ({
  useUIStore: (selector: (s: {
    onboardingDraft: Record<string, unknown>;
    setOnboardingDraft: typeof mockSetOnboardingDraft;
    clearOnboardingDraft: typeof mockClearOnboardingDraft;
  }) => unknown) =>
    selector({
      onboardingDraft: mockOnboardingDraft,
      setOnboardingDraft: mockSetOnboardingDraft,
      clearOnboardingDraft: mockClearOnboardingDraft,
    }),
}));

import OnboardingStep1 from '@/app/onboarding/step-1';

function renderStep1() {
  return render(React.createElement(OnboardingStep1));
}

describe('OnboardingStep1 — Intent Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnboardingDraft = {};
  });

  it('renders the title and all four intent options', () => {
    renderStep1();
    expect(screen.getByText('Where would you like to start?')).toBeTruthy();
    expect(screen.getByText('Buy')).toBeTruthy();
    expect(screen.getByText('Rent')).toBeTruthy();
    expect(screen.getByText('Sell')).toBeTruthy();
    expect(screen.getByText('Just browse')).toBeTruthy();
  });

  it('tapping Buy saves intent and navigates to step-2', () => {
    renderStep1();
    fireEvent.press(screen.getByText('Buy'));
    expect(mockSetOnboardingDraft).toHaveBeenCalledWith({ intent: 'buy' });
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding/step-2');
  });

  it('tapping Rent saves intent and navigates to step-2', () => {
    renderStep1();
    fireEvent.press(screen.getByText('Rent'));
    expect(mockSetOnboardingDraft).toHaveBeenCalledWith({ intent: 'rent' });
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding/step-2');
  });

  it('tapping Sell saves intent and navigates to step-2', () => {
    renderStep1();
    fireEvent.press(screen.getByText('Sell'));
    expect(mockSetOnboardingDraft).toHaveBeenCalledWith({ intent: 'sell' });
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding/step-2');
  });

  it('tapping Just browse saves browse intent and navigates to step-2', () => {
    renderStep1();
    fireEvent.press(screen.getByText('Just browse'));
    expect(mockSetOnboardingDraft).toHaveBeenCalledWith({ intent: 'browse' });
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding/step-2');
  });
});

// Test for the onboarding skip behaviour via the layout's header
// We test the layout by mocking Stack and rendering the layout directly.
// Stack is already mocked to return null above via the expo-router mock.
import OnboardingLayout from '@/app/onboarding/_layout';

describe('OnboardingLayout — Skip All', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnboardingDraft = {};
  });

  it('renders the progress indicator (Step 1 of 5)', () => {
    render(React.createElement(OnboardingLayout));
    expect(screen.getByText('Step 1 of 5')).toBeTruthy();
  });

  it('pressing Skip All clears draft and navigates to search', () => {
    render(React.createElement(OnboardingLayout));
    fireEvent.press(screen.getByText('Skip all'));
    expect(mockClearOnboardingDraft).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/search');
  });
});
