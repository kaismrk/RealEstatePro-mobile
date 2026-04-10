import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendInquiry } from '@/hooks/useSendInquiry';

const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const MOCK_MESSAGE_RESPONSE = {
  id: 1,
  sender_id: 10,
  recipient_id: 5,
  property_id: 42,
  body: 'Hi, I am interested in this property.',
  created_at: new Date().toISOString(),
};

describe('useSendInquiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts to the correct endpoint with message body', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_MESSAGE_RESPONSE });

    const { result } = renderHook(() => useSendInquiry(42), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ body: 'Hi, I am interested in this property.' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPost).toHaveBeenCalledWith(
      '/messages/properties/42/inquire',
      { body: 'Hi, I am interested in this property.' }
    );
  });

  it('works with string property id', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_MESSAGE_RESPONSE });

    const { result } = renderHook(() => useSendInquiry('42'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ body: 'Test message' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPost).toHaveBeenCalledWith(
      '/messages/properties/42/inquire',
      { body: 'Test message' }
    );
  });

  it('returns the message response data on success', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_MESSAGE_RESPONSE });

    const { result } = renderHook(() => useSendInquiry(42), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ body: 'Hello' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_MESSAGE_RESPONSE);
  });

  it('returns error state on API failure', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useSendInquiry(42), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ body: 'Hello' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Unauthorized');
  });

  it('calls onSuccess callback when mutation succeeds', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_MESSAGE_RESPONSE });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useSendInquiry(42), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ body: 'Hello' }, { onSuccess });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // TanStack Query v5 calls onSuccess with (data, variables, context)
    expect(onSuccess).toHaveBeenCalled();
    const [calledData, calledVariables] = onSuccess.mock.calls[0] as [typeof MOCK_MESSAGE_RESPONSE, { body: string }];
    expect(calledData).toEqual(MOCK_MESSAGE_RESPONSE);
    expect(calledVariables).toEqual({ body: 'Hello' });
  });

  it('sends the exact body string without modification', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_MESSAGE_RESPONSE });

    const { result } = renderHook(() => useSendInquiry(42), {
      wrapper: createWrapper(),
    });

    const customBody = 'I would like to schedule a viewing for next Tuesday.';

    await act(async () => {
      result.current.mutate({ body: customBody });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArgs = mockApiPost.mock.calls[0];
    expect(callArgs[1]).toEqual({ body: customBody });
  });
});
