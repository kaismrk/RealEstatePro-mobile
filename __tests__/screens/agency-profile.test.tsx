import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// expo-router mock
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    push: (...args: unknown[]) => mockRouterPush(...args),
  },
  useLocalSearchParams: () => ({ id: '1' }),
}));

// API mock
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

import AgencyProfileScreen from '@/app/agency/[id]';
import type { AgencyResponse } from '@/hooks/useAgencies';

const MOCK_AGENCY: AgencyResponse = {
  id: 1,
  name: 'Alpha Realty',
  logo_url: null,
  description: 'Premier real estate agency in Tunisia',
  social_links: { website: 'https://alpha.com', facebook: 'https://fb.com/alpha' },
  country_code: 'TN',
  owner_id: 42,
  created_at: '2026-01-01T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderScreen() {
  return render(React.createElement(createWrapper(), null, React.createElement(AgencyProfileScreen)));
}

describe('AgencyProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator while fetching', () => {
    mockApiGet.mockReturnValue(new Promise(() => {})); // never resolves
    renderScreen();
    // ActivityIndicator renders without a testID — check it's not in the loaded state
    expect(screen.queryByText('Alpha Realty')).toBeNull();
    expect(screen.queryByText('Agency not found')).toBeNull();
  });

  it('displays agency name and description on load', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_AGENCY });
    const { unmount } = renderScreen();

    await waitFor(() => expect(screen.getByText('Alpha Realty')).toBeTruthy());
    expect(screen.getByText('Premier real estate agency in Tunisia')).toBeTruthy();
    unmount();
  });

  it('shows the country code in the About section', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_AGENCY });
    const { unmount } = renderScreen();

    await waitFor(() => expect(screen.getByText('Country')).toBeTruthy());
    // Country code 'TN' appears in both the header badge and the about section — use getAllByText
    const tnElements = screen.getAllByText('TN');
    expect(tnElements.length).toBeGreaterThanOrEqual(1);
    unmount();
  });

  it('shows error state when agency not found', async () => {
    mockApiGet.mockRejectedValue({ response: { status: 404 } });
    const { unmount } = renderScreen();

    await waitFor(() => expect(screen.getByText('Agency not found')).toBeTruthy());
    unmount();
  });

  it('shows Contact Agency CTA', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_AGENCY });
    const { unmount } = renderScreen();

    await waitFor(() => expect(screen.getByText('Contact Agency')).toBeTruthy());
    unmount();
  });
});
