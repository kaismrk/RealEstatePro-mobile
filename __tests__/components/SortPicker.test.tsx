import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SortPicker } from '@/components/search/SortPicker';

// Mock search store
const mockSetSortBy = jest.fn();
let mockSortBy = 'date_desc';

jest.mock('@/lib/stores/search.store', () => ({
  useSearchStore: (selector: (s: { sortBy: string; setSortBy: typeof mockSetSortBy }) => unknown) =>
    selector({ sortBy: mockSortBy, setSortBy: mockSetSortBy }),
}));

describe('SortPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSortBy = 'date_desc';
  });

  it('renders all sort options', () => {
    render(<SortPicker />);
    expect(screen.getByText('Newest')).toBeTruthy();
    expect(screen.getByText('Oldest')).toBeTruthy();
    expect(screen.getByText('Price \u2191')).toBeTruthy();
    expect(screen.getByText('Price \u2193')).toBeTruthy();
    expect(screen.getByText('Area \u2191')).toBeTruthy();
    expect(screen.getByText('Area \u2193')).toBeTruthy();
  });

  it('calls setSortBy with date_desc when tapping Newest', () => {
    render(<SortPicker />);
    fireEvent.press(screen.getByText('Newest'));
    expect(mockSetSortBy).toHaveBeenCalledWith('date_desc');
  });

  it('calls setSortBy with price_asc when tapping Price up', () => {
    render(<SortPicker />);
    fireEvent.press(screen.getByText('Price \u2191'));
    expect(mockSetSortBy).toHaveBeenCalledWith('price_asc');
  });

  it('calls setSortBy with area_desc when tapping Area down', () => {
    render(<SortPicker />);
    fireEvent.press(screen.getByText('Area \u2193'));
    expect(mockSetSortBy).toHaveBeenCalledWith('area_desc');
  });

  it('selected pill has distinct accessibilityState selected=true', () => {
    mockSortBy = 'date_desc';
    render(<SortPicker />);
    const newestBtn = screen.getByLabelText('Sort by Newest');
    expect(newestBtn.props.accessibilityState).toEqual({ selected: true });
  });

  it('non-selected pill has accessibilityState selected=false', () => {
    mockSortBy = 'date_desc';
    render(<SortPicker />);
    const oldestBtn = screen.getByLabelText('Sort by Oldest');
    expect(oldestBtn.props.accessibilityState).toEqual({ selected: false });
  });
});
