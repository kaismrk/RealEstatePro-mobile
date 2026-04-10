import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MessageCard } from '@/components/messaging/MessageCard';
import type { MessageResponse } from '@/lib/types/message';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

const BASE_MESSAGE: MessageResponse = {
  id: 1,
  sender_id: 10,
  sender_name: 'Alice Smith',
  sender_email: 'alice@example.com',
  recipient_id: 5,
  property_id: 42,
  property: { id: 42, title: 'Luxury Villa Tunis', price: 500000 },
  body: 'Hello, I am very interested in visiting this property at your earliest convenience.',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  read_at: null,
  is_read: false,
};

describe('MessageCard', () => {
  it('renders sender name', () => {
    render(<MessageCard message={BASE_MESSAGE} onPress={jest.fn()} />);
    expect(screen.getByText('Alice Smith')).toBeTruthy();
  });

  it('renders body preview truncated at 80 chars', () => {
    const longBody =
      'A'.repeat(90);
    const message: MessageResponse = { ...BASE_MESSAGE, body: longBody };
    render(<MessageCard message={message} onPress={jest.fn()} />);
    // Truncated at 80 chars + ellipsis
    const expected = 'A'.repeat(80) + '…';
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('renders body without truncation when <= 80 chars', () => {
    const shortBody = 'Short message body.';
    const message: MessageResponse = { ...BASE_MESSAGE, body: shortBody };
    render(<MessageCard message={message} onPress={jest.fn()} />);
    expect(screen.getByText(shortBody)).toBeTruthy();
  });

  it('shows unread dot when is_read is false', () => {
    render(<MessageCard message={BASE_MESSAGE} onPress={jest.fn()} />);
    expect(screen.getByLabelText('Unread')).toBeTruthy();
  });

  it('does NOT show unread dot when is_read is true', () => {
    const readMessage: MessageResponse = {
      ...BASE_MESSAGE,
      is_read: true,
      read_at: new Date().toISOString(),
    };
    render(<MessageCard message={readMessage} onPress={jest.fn()} />);
    expect(screen.queryByLabelText('Unread')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<MessageCard message={BASE_MESSAGE} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: /Message from Alice Smith/i }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders time ago text', () => {
    render(<MessageCard message={BASE_MESSAGE} onPress={jest.fn()} />);
    // Should show "2h ago"
    expect(screen.getByText('2h ago')).toBeTruthy();
  });

  it('renders property title when provided', () => {
    render(<MessageCard message={BASE_MESSAGE} onPress={jest.fn()} />);
    expect(screen.getByText('Luxury Villa Tunis')).toBeTruthy();
  });

  it('renders sender initials in avatar', () => {
    render(<MessageCard message={BASE_MESSAGE} onPress={jest.fn()} />);
    // Alice Smith -> AS
    expect(screen.getByText('AS')).toBeTruthy();
  });

  it('falls back to email when sender_name is missing', () => {
    const message: MessageResponse = { ...BASE_MESSAGE, sender_name: undefined };
    render(<MessageCard message={message} onPress={jest.fn()} />);
    expect(screen.getByText('alice@example.com')).toBeTruthy();
  });

  it('shows "Unknown sender" when no name or email', () => {
    const message: MessageResponse = {
      ...BASE_MESSAGE,
      sender_name: undefined,
      sender_email: undefined,
    };
    render(<MessageCard message={message} onPress={jest.fn()} />);
    expect(screen.getByText('Unknown sender')).toBeTruthy();
  });
});
