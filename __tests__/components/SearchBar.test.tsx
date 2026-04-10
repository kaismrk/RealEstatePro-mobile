import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SearchBar } from '@/components/search/SearchBar';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock search store
const mockSetFilters = jest.fn();
const mockFilters: { q?: string } = {};

jest.mock('@/lib/stores/search.store', () => ({
  useSearchStore: (selector: (s: { filters: typeof mockFilters; setFilters: typeof mockSetFilters }) => unknown) =>
    selector({ filters: mockFilters, setFilters: mockSetFilters }),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFilters.q = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the search input', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Search properties...')).toBeTruthy();
  });

  it('does not fire setFilters immediately on typing', () => {
    render(<SearchBar />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Search properties...'),
      'villa'
    );
    expect(mockSetFilters).not.toHaveBeenCalled();
  });

  it('fires setFilters after 300ms debounce', () => {
    render(<SearchBar />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Search properties...'),
      'villa'
    );
    // Not called yet at 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(mockSetFilters).not.toHaveBeenCalled();
    // Called at 300ms
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockSetFilters).toHaveBeenCalledWith({ q: 'villa' });
  });

  it('does not call setFilters at 200ms', () => {
    render(<SearchBar />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Search properties...'),
      'apartment'
    );
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(mockSetFilters).not.toHaveBeenCalled();
  });

  it('shows clear button when text is present', () => {
    render(<SearchBar />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Search properties...'),
      'villa'
    );
    expect(screen.getByLabelText('Clear search')).toBeTruthy();
  });

  it('X button clears the input and calls setFilters with undefined', () => {
    render(<SearchBar />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Search properties...'),
      'villa'
    );
    act(() => {
      jest.advanceTimersByTime(300);
    });
    jest.clearAllMocks();

    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.press(clearBtn);

    expect(screen.getByPlaceholderText('Search properties...')).toHaveProp(
      'value',
      ''
    );
    expect(mockSetFilters).toHaveBeenCalledWith({ q: undefined });
  });

  it('shows filter badge count when activeFilterCount > 0', () => {
    render(<SearchBar activeFilterCount={3} />);
    expect(screen.getByText('3')).toBeTruthy();
  });
});
