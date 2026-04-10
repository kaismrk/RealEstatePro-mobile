import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InboxScreen from '@/app/messaging/inbox';
import type { MessageList } from '@/lib/types/message';

// Mock expo-router
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

// Mock API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

// Mutable auth state
let mockAccessToken: string | null = null;
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (
    selector: (s: { accessToken: string | null; countryCode: string }) => unknown
  ) => selector({ accessToken: mockAccessToken, countryCode: 'TN' }),
}));

const MOCK_MESSAGES: MessageList = {
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
      created_at: '2026-04-07T10:00:00Z',
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
      body: 'Is this still available for viewing?',
      created_at: '2026-04-06T09:00:00Z',
      read_at: '2026-04-06T11:00:00Z',
      is_read: true,
    },
  ],
};

const EMPTY_MESSAGES: MessageList = { total: 0, items: [] };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderInbox() {
  return render(
    React.createElement(createWrapper(), null, React.createElement(InboxScreen))
  );
}

describe('InboxScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = null;
  });

  it('redirects unauthenticated users to welcome screen', () => {
    mockAccessToken = null;
    renderInbox();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)/welcome');
  });

  it('renders the Messages header for authenticated users', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGES });

    renderInbox();

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeTruthy();
    });
  });

  it('renders message list for authenticated users', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGES });

    renderInbox();

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
      expect(screen.getByText('Bob Jones')).toBeTruthy();
    });
  });

  it('shows empty state when no messages', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValueOnce({ data: EMPTY_MESSAGES });

    renderInbox();

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeTruthy();
    });
  });

  it('shows unread count badge when there are unread messages', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValueOnce({ data: MOCK_MESSAGES });

    renderInbox();

    await waitFor(() => {
      // 1 unread message in MOCK_MESSAGES
      expect(screen.getByText('1')).toBeTruthy();
    });
  });

  it('does not show badge when all messages are read', async () => {
    mockAccessToken = 'valid-token';
    const allRead: MessageList = {
      total: 1,
      items: [
        {
          ...MOCK_MESSAGES.items[1]!,
        },
      ],
    };
    mockApiGet.mockResolvedValueOnce({ data: allRead });

    renderInbox();

    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeTruthy();
    });
    // Should not show any count badge
    expect(screen.queryByText('0')).toBeNull();
  });
});
