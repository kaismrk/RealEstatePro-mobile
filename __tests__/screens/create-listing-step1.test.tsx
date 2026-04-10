import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Expo-router mock
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    back: (...args: unknown[]) => mockRouterBack(...args),
    replace: jest.fn(),
  },
}));

// Auth store mock
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { countryCode: string }) => unknown) =>
    selector({ countryCode: 'TN' }),
}));

// UI store mock — mutable draft
let mockDraft: Record<string, unknown> = {};
const mockSetDraft = jest.fn((partial: Record<string, unknown>) => {
  mockDraft = { ...mockDraft, ...partial };
});

jest.mock('@/lib/stores/ui.store', () => ({
  useUIStore: (selector: (s: {
    createListingDraft: Record<string, unknown> | null;
    setDraft: typeof mockSetDraft;
  }) => unknown) =>
    selector({ createListingDraft: mockDraft, setDraft: mockSetDraft }),
}));

import CreateStep1 from '@/app/listings/create/step-1';

function renderStep1() {
  return render(React.createElement(CreateStep1));
}

describe('CreateStep1 — Basic Info', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraft = {};
  });

  it('renders the step heading', () => {
    renderStep1();
    expect(screen.getByText('Create Listing')).toBeTruthy();
    expect(screen.getByText('Step 1 of 5 — Basic Info')).toBeTruthy();
  });

  it('blocks "Next" when title is empty', () => {
    renderStep1();
    fireEvent.press(screen.getByText('Next: Location'));
    expect(screen.getByText('Title is required')).toBeTruthy();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('blocks "Next" when price is empty', () => {
    renderStep1();
    // Fill title but leave price empty
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Spacious 3-bedroom apartment in city center'),
      'Test Title'
    );
    fireEvent.press(screen.getByText('Next: Location'));
    expect(screen.getByText('A valid price is required')).toBeTruthy();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('blocks "Next" when no property type is selected', () => {
    renderStep1();
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Spacious 3-bedroom apartment in city center'),
      'Test Title'
    );
    fireEvent.changeText(screen.getByPlaceholderText('0'), '100000');
    fireEvent.press(screen.getByText('Next: Location'));
    expect(screen.getByText('Select a property type')).toBeTruthy();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('proceeds to step-2 when all required fields are filled', () => {
    renderStep1();
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Spacious 3-bedroom apartment in city center'),
      'My Apartment'
    );
    fireEvent.changeText(screen.getByPlaceholderText('0'), '150000');
    fireEvent.press(screen.getByText('Apartment'));
    fireEvent.press(screen.getByText('Next: Location'));
    expect(mockRouterPush).toHaveBeenCalledWith('/listings/create/step-2');
  });

  it('selecting a property type chip toggles its selection', () => {
    renderStep1();
    // Select Villa chip
    const villaChip = screen.getByText('Villa');
    fireEvent.press(villaChip);
    // Now fill required fields and submit — should pass with Villa selected
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Spacious 3-bedroom apartment in city center'),
      'My Villa'
    );
    fireEvent.changeText(screen.getByPlaceholderText('0'), '200000');
    fireEvent.press(screen.getByText('Next: Location'));
    expect(mockSetDraft).toHaveBeenCalledWith(
      expect.objectContaining({ property_type: 'villa' })
    );
  });

  it('saves draft with correct values when proceeding', () => {
    renderStep1();
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Spacious 3-bedroom apartment in city center'),
      'Test House'
    );
    fireEvent.changeText(screen.getByPlaceholderText('0'), '80000');
    fireEvent.press(screen.getByText('House'));
    // Change listing type to rent
    fireEvent.press(screen.getByText('For Rent'));
    fireEvent.press(screen.getByText('Next: Location'));
    expect(mockSetDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test House',
        price: 80000,
        property_type: 'house',
        listing_type: 'rent',
        country_code: 'TN',
      })
    );
  });
});
