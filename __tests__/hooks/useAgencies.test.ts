import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    patch: (...args: unknown[]) => mockApiPatch(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

import {
  useAgencies,
  useAgency,
  useCreateAgency,
  useUpdateAgency,
  useDeleteAgency,
} from '@/hooks/useAgencies';
import type { AgencyResponse, AgencyList } from '@/hooks/useAgencies';

const MOCK_AGENCY: AgencyResponse = {
  id: 1,
  name: 'Alpha Realty',
  logo_url: null,
  description: 'Top real estate agency',
  social_links: { website: 'https://alpha.com' },
  country_code: 'TN',
  owner_id: 42,
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_LIST: AgencyList = {
  total: 1,
  items: [MOCK_AGENCY],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAgencies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the agency list', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_LIST });
    const { result } = renderHook(() => useAgencies(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(1);
    expect(result.current.data?.items[0].name).toBe('Alpha Realty');
  });

  it('passes country_code as query param', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_LIST });
    renderHook(() => useAgencies('TN'), { wrapper: createWrapper() });

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/agencies/?country_code=TN'));
  });

  it('fetches without country_code when not provided', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_LIST });
    renderHook(() => useAgencies(), { wrapper: createWrapper() });

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/agencies/'));
  });
});

describe('useAgency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a single agency by id', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_AGENCY });
    const { result } = renderHook(() => useAgency(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Alpha Realty');
    expect(mockApiGet).toHaveBeenCalledWith('/agencies/1');
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useAgency(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();
  });
});

describe('useCreateAgency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /agencies/ with the payload', async () => {
    mockApiPost.mockResolvedValue({ data: MOCK_AGENCY });
    mockApiGet.mockResolvedValue({ data: MOCK_LIST });

    const { result } = renderHook(() => useCreateAgency(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        name: 'Alpha Realty',
        country_code: 'TN',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiPost).toHaveBeenCalledWith('/agencies/', {
      name: 'Alpha Realty',
      country_code: 'TN',
    });
    expect(result.current.data?.id).toBe(1);
  });
});

describe('useUpdateAgency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls PATCH /agencies/{id} with the update payload', async () => {
    const updated = { ...MOCK_AGENCY, name: 'Beta Realty' };
    mockApiPatch.mockResolvedValue({ data: updated });
    mockApiGet.mockResolvedValue({ data: MOCK_LIST });

    const { result } = renderHook(() => useUpdateAgency(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ id: 1, data: { name: 'Beta Realty' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiPatch).toHaveBeenCalledWith('/agencies/1', { name: 'Beta Realty' });
    expect(result.current.data?.name).toBe('Beta Realty');
  });
});

describe('useDeleteAgency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls DELETE /agencies/{id}', async () => {
    mockApiDelete.mockResolvedValue({ data: undefined });
    mockApiGet.mockResolvedValue({ data: { total: 0, items: [] } });

    const { result } = renderHook(() => useDeleteAgency(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiDelete).toHaveBeenCalledWith('/agencies/1');
  });
});
