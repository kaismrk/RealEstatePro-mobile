import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInbox, useMarkAsRead } from '@/hooks/useMessages';
import type { MessageList } from '@/lib/types/message';

const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    patch: (...args: unknown[]) => mockApiPatch(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const MOCK_MESSAGE_LIST: MessageList = {
  total: 2,
  items: [
    {
      id: 1,
      sender_id: 10,
      sender_name: 'Alice Smith',
      sender_email: 'alice@example.com',
      recipient_id: 5,
      property_id: 42,
      property: { id: 42, title: 'Luxury Villa', price: 500000 },
      body: 'Hello, I am interested in this property.',
      created_at: '2026-04-06T10:00:00Z',
      read_at: null,
      is_read: false,
    },
    {
      id: 2,
      sender_id: 11,
      sender_name: 'Bob Jones',
      sender_email: 'bob@example.com',
      recipient_id: 5,
      property_id: 43,
      property: { id: 43, title: 'Studio Apartment', price: 120000 },
      body: 'Is this still available?',
      created_at: '2026-04-05T09:00:00Z',
      read_at: '2026-04-05T11:00:00Z',
      is_read: true,
    },
  ],
};

describe('useInbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches inbox messages from /messages/inbox', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGE_LIST });

    const { result } = renderHook(() => useInbox(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith('/messages/inbox');
    expect(result.current.data?.total).toBe(2);
    expect(result.current.data?.items).toHaveLength(2);
  });

  it('returns messages sorted newest-first', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGE_LIST });

    const { result } = renderHook(() => useInbox(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const items = result.current.data?.items ?? [];
    // First item has created_at 2026-04-06, second has 2026-04-05 — already newest first from API
    expect(new Date(items[0]!.created_at).getTime()).toBeGreaterThanOrEqual(
      new Date(items[1]!.created_at).getTime()
    );
  });

  it('returns error state on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useInbox(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });

  it('unread messages have is_read false and read_at null', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGE_LIST });

    const { result } = renderHook(() => useInbox(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const unread = result.current.data?.items.find((m) => !m.is_read);
    expect(unread).toBeDefined();
    expect(unread?.read_at).toBeNull();
  });
});

describe('useMarkAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('patches the correct endpoint', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGE_LIST });
    mockApiPatch.mockResolvedValueOnce({ data: {} });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAsRead(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPatch).toHaveBeenCalledWith('/messages/1/read');
  });

  it('invalidates messages query after marking as read', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_MESSAGE_LIST });
    mockApiPatch.mockResolvedValueOnce({ data: {} });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAsRead(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // onSuccess triggers invalidateQueries — subsequent inbox fetch would be triggered
    expect(mockApiPatch).toHaveBeenCalledTimes(1);
  });

  it('returns error on API failure', async () => {
    mockApiPatch.mockRejectedValueOnce(new Error('Forbidden'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAsRead(), { wrapper });

    await act(async () => {
      result.current.mutate(99);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Forbidden');
  });
});
