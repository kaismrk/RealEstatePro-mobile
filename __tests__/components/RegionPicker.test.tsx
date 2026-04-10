import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RegionPicker } from '@/components/geo/RegionPicker';
import type { Region } from '@/hooks/useRegions';

// Mock the hooks — same pattern as CountrySelector.test.tsx
jest.mock('@/hooks/useRegions', () => ({
  useTopLevelRegions: jest.fn(),
  useChildRegions: jest.fn(),
}));

import { useTopLevelRegions, useChildRegions } from '@/hooks/useRegions';

const mockUseTopLevelRegions = useTopLevelRegions as jest.Mock;
const mockUseChildRegions = useChildRegions as jest.Mock;

function makeRegion(id: number, name: string, level: string, parentId: number | null = null): Region {
  return {
    id,
    name,
    level,
    country_code: 'TN',
    parent_id: parentId,
    code: null,
    created_at: new Date().toISOString(),
  };
}

const MOCK_REGIONS = [
  makeRegion(1, 'Tunis', 'region'),
  makeRegion(2, 'Ariana', 'region'),
];

const MOCK_DEPARTMENTS = [
  makeRegion(10, 'Tunis Medina', 'department', 1),
  makeRegion(11, 'Bab Bhar', 'department', 1),
];

const MOCK_CITIES = [
  makeRegion(100, 'Bab El Bhar', 'city', 10),
  makeRegion(101, 'El Omrane', 'city', 10),
];

function makeQueryResult(items: Region[], extra: Partial<{ isLoading: boolean; isSuccess: boolean }> = {}) {
  return {
    data: { total: items.length, items },
    isLoading: false,
    isSuccess: true,
    isError: false,
    ...extra,
  };
}

describe('RegionPicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTopLevelRegions.mockReturnValue(makeQueryResult(MOCK_REGIONS));
    // useChildRegions is called with parent IDs; default to empty
    mockUseChildRegions.mockReturnValue(makeQueryResult([]));
  });

  it('renders region selector button enabled', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    const regionBtn = screen.getByTestId('region-selector');
    expect(regionBtn).toBeTruthy();
    expect(regionBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('department selector is disabled until region is selected', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    const deptBtn = screen.getByTestId('department-selector');
    expect(deptBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('city selector is disabled until department is selected', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    const cityBtn = screen.getByTestId('city-selector');
    expect(cityBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('opens region sheet (modal) when region selector pressed', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    fireEvent.press(screen.getByTestId('region-selector'));
    // Region names from the mock should appear in the modal
    expect(screen.getByText('Tunis')).toBeTruthy();
    expect(screen.getByText('Ariana')).toBeTruthy();
  });

  it('selecting a region enables department dropdown and fires useChildRegions with correct parent ID', () => {
    mockUseChildRegions.mockImplementation((parentId: number | null) => {
      if (parentId === 1) return makeQueryResult(MOCK_DEPARTMENTS);
      return makeQueryResult([]);
    });

    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    // Open region sheet and select Tunis
    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    // Department selector should now be enabled
    const deptBtn = screen.getByTestId('department-selector');
    expect(deptBtn.props.accessibilityState?.disabled).toBeFalsy();

    // useChildRegions should have been called with parentId=1
    expect(mockUseChildRegions).toHaveBeenCalledWith(1);
  });

  it('onChange is called with null/[] when only region is selected', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    expect(mockOnChange).toHaveBeenCalledWith(null, []);
  });

  it('selecting a city fires onChange with the city ID and full path [region, dept, city]', () => {
    mockUseChildRegions.mockImplementation((parentId: number | null) => {
      if (parentId === 1) return makeQueryResult(MOCK_DEPARTMENTS);
      if (parentId === 10) return makeQueryResult(MOCK_CITIES);
      return makeQueryResult([]);
    });

    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    // Select region
    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    // Select department
    fireEvent.press(screen.getByTestId('department-selector'));
    fireEvent.press(screen.getByText('Tunis Medina'));

    // Select city
    fireEvent.press(screen.getByTestId('city-selector'));
    fireEvent.press(screen.getByText('Bab El Bhar'));

    // Last onChange call should have city ID and full 3-item path
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(100); // city id
    expect(lastCall[1]).toHaveLength(3);
    expect(lastCall[1][0].name).toBe('Tunis');
    expect(lastCall[1][1].name).toBe('Tunis Medina');
    expect(lastCall[1][2].name).toBe('Bab El Bhar');
  });

  it('clear button resets all three levels and calls onChange(null, [])', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    // Select a region to get some state
    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    // Clear button appears
    const clearBtn = screen.getByLabelText('Clear location selection');
    fireEvent.press(clearBtn);

    // All rows reset to placeholder text
    expect(screen.getByText('Select a region')).toBeTruthy();
    expect(screen.getByText('Select a department')).toBeTruthy();
    expect(screen.getByText('Select a city')).toBeTruthy();

    // onChange called with null/[]
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toBeNull();
    expect(lastCall[1]).toHaveLength(0);
  });

  it('selecting a new region clears department and city', () => {
    mockUseChildRegions.mockImplementation((parentId: number | null) => {
      if (parentId === 1) return makeQueryResult(MOCK_DEPARTMENTS);
      return makeQueryResult([]);
    });

    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    // Select Tunis
    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    // Now select Ariana
    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Ariana'));

    // Department and city should be reset
    expect(screen.getByText('Select a department')).toBeTruthy();
    expect(screen.getByText('Select a city')).toBeTruthy();
  });

  it('handles empty region list gracefully — shows empty message', () => {
    mockUseTopLevelRegions.mockReturnValue(makeQueryResult([]));

    render(
      <RegionPicker countryCode="DZ" value={null} onChange={mockOnChange} />
    );

    fireEvent.press(screen.getByTestId('region-selector'));
    expect(screen.getByText('No regions available for this country yet.')).toBeTruthy();
  });

  it('shows loading spinner when regions are loading', () => {
    mockUseTopLevelRegions.mockReturnValue({
      data: null,
      isLoading: true,
      isSuccess: false,
    });

    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    fireEvent.press(screen.getByTestId('region-selector'));
    // ActivityIndicator should be visible during load
    expect(screen.getByTestId('region-loading')).toBeTruthy();
  });

  it('does not show clear button when nothing is selected', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    expect(screen.queryByLabelText('Clear location selection')).toBeNull();
  });

  it('shows selected region name in the selector row', () => {
    render(
      <RegionPicker countryCode="TN" value={null} onChange={mockOnChange} />
    );

    fireEvent.press(screen.getByTestId('region-selector'));
    fireEvent.press(screen.getByText('Tunis'));

    // "Tunis" should appear as selected value in the row
    // (The row text is still "Tunis" but now shown as selected, not as a list item)
    // After closing the sheet there is only one "Tunis" text — the selected label
    expect(screen.getAllByText('Tunis').length).toBeGreaterThanOrEqual(1);
  });
});
