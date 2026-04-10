import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CountrySelector } from '@/components/shared/CountrySelector';
import type { CountryPublicResponse } from '@/hooks/useCountries';

// Mock the useCountries hook
jest.mock('@/hooks/useCountries', () => ({
  useCountries: jest.fn(),
}));

// Mock BottomSheet to render children directly in tests
jest.mock('@/components/ui/BottomSheet', () => ({
  BottomSheet: ({
    visible,
    children,
  }: {
    visible: boolean;
    children: React.ReactNode;
  }) => (visible ? children : null),
}));

import { useCountries } from '@/hooks/useCountries';

const mockUseCountries = useCountries as jest.Mock;

const MOCK_COUNTRIES: CountryPublicResponse[] = [
  { country_code: 'TN', name: 'Tunisia', locale: 'ar', currency: 'TND' },
  { country_code: 'MA', name: 'Morocco', locale: 'ar', currency: 'MAD' },
  { country_code: 'FR', name: 'France', locale: 'fr', currency: 'EUR' },
];

describe('CountrySelector', () => {
  beforeEach(() => {
    mockUseCountries.mockReturnValue({ data: MOCK_COUNTRIES, isLoading: false });
  });

  it('renders compact trigger with selected flag and code', () => {
    render(<CountrySelector selectedCode="TN" onSelect={jest.fn()} />);
    expect(screen.getByText('TN')).toBeTruthy();
  });

  it('opens bottom sheet and shows country list on press', () => {
    render(<CountrySelector selectedCode="TN" onSelect={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Select country'));

    expect(screen.getByText('Tunisia')).toBeTruthy();
    expect(screen.getByText('Morocco')).toBeTruthy();
    expect(screen.getByText('France')).toBeTruthy();
  });

  it('calls onSelect with correct country_code when country is tapped', () => {
    const onSelect = jest.fn();
    render(<CountrySelector selectedCode="TN" onSelect={onSelect} />);

    // Open the bottom sheet
    fireEvent.press(screen.getByLabelText('Select country'));

    // Tap Morocco
    fireEvent.press(screen.getByLabelText('Select Morocco'));

    expect(onSelect).toHaveBeenCalledWith('MA');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows flag emoji and currency for each country', () => {
    render(<CountrySelector selectedCode="TN" onSelect={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Select country'));

    expect(screen.getByText('TND')).toBeTruthy();
    expect(screen.getByText('MAD')).toBeTruthy();
    expect(screen.getByText('EUR')).toBeTruthy();
  });
});
