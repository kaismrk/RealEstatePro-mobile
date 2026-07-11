import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ── Theme mock — tests don't need real SecureStore/Appearance wiring ──────────
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

import { SearchThisAreaButton } from '@/components/map/SearchThisAreaButton';

describe('SearchThisAreaButton', () => {
  it('renders nothing when visible is false', () => {
    const { toJSON } = render(
      <SearchThisAreaButton visible={false} onPress={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the button when visible is true', () => {
    render(<SearchThisAreaButton visible={true} onPress={jest.fn()} />);
    expect(screen.getByTestId('search-this-area-button')).toBeTruthy();
  });

  it('shows "Search this area" label', () => {
    render(<SearchThisAreaButton visible={true} onPress={jest.fn()} />);
    expect(screen.getByText('Search this area')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<SearchThisAreaButton visible={true} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('search-this-area-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when loading', () => {
    const onPress = jest.fn();
    render(<SearchThisAreaButton visible={true} loading={true} onPress={onPress} />);
    // Button is disabled when loading — check accessibilityState or disabled prop
    const button = screen.getByTestId('search-this-area-button');
    // TouchableOpacity renders with disabled prop which maps to accessibilityState
    const isDisabled =
      button.props.disabled === true ||
      button.props.accessibilityState?.disabled === true;
    expect(isDisabled).toBe(true);
  });

  it('shows loading indicator when loading prop is true', () => {
    render(<SearchThisAreaButton visible={true} loading={true} onPress={jest.fn()} />);
    expect(screen.getByTestId('search-loading')).toBeTruthy();
  });

  it('hides loading indicator when loading is false', () => {
    render(<SearchThisAreaButton visible={true} loading={false} onPress={jest.fn()} />);
    expect(screen.queryByTestId('search-loading')).toBeNull();
  });

  it('transitions from hidden to visible', () => {
    const { rerender, toJSON } = render(
      <SearchThisAreaButton visible={false} onPress={jest.fn()} />
    );
    expect(toJSON()).toBeNull();

    rerender(<SearchThisAreaButton visible={true} onPress={jest.fn()} />);
    expect(screen.getByTestId('search-this-area-button')).toBeTruthy();
  });

  it('transitions from visible to hidden', () => {
    const { rerender } = render(
      <SearchThisAreaButton visible={true} onPress={jest.fn()} />
    );
    expect(screen.getByTestId('search-this-area-button')).toBeTruthy();

    rerender(<SearchThisAreaButton visible={false} onPress={jest.fn()} />);
    expect(screen.queryByTestId('search-this-area-button')).toBeNull();
  });
});
