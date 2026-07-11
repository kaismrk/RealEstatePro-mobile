/**
 * Tests for phone validation in the sign-up register screen.
 * Mocks PhoneInput so we control isValid independently of libphonenumber-js.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// ── router mock ───────────────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    back: mockRouterBack,
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
  useLocalSearchParams: () => ({ email: 'test@example.com' }),
}));

// ── auth store mock ───────────────────────────────────────────────────────────
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { countryCode: string }) => unknown) =>
    selector({ countryCode: 'TN' }),
}));

// ── PhoneInput mock ───────────────────────────────────────────────────────────
// Typing 'VALID' triggers isValid=true; anything else is invalid.
// Note: jest.mock factories are hoisted — must not reference outer-scope imports.
// Use require() calls inside the factory instead.
jest.mock('@/components/inputs/PhoneInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockReact = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockRN = require('react-native');
  return {
    PhoneInput: ({
      value,
      onValueChange,
    }: {
      value: string;
      onValueChange: (v: { raw: string; e164: string; isValid: boolean }) => void;
    }) =>
      mockReact.createElement(mockRN.TextInput, {
        testID: 'phone-input',
        placeholder: '+216 12 345 678',
        value,
        onChangeText: (text: string) =>
          onValueChange({
            raw: text,
            e164: text === 'VALID' ? '+21620123456' : '',
            isValid: text === 'VALID',
          }),
      }),
  };
});

import RegisterScreen from '@/app/(auth)/register';

function renderRegister() {
  return render(React.createElement(RegisterScreen));
}

describe('RegisterScreen — phone validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Next button is disabled when phone is empty', () => {
    renderRegister();
    // Fill only first/last name — leave phone blank
    fireEvent.changeText(screen.getByPlaceholderText('Jane'), 'Alice');
    fireEvent.changeText(screen.getByPlaceholderText('Smith'), 'Martin');
    // The Next button should be disabled (no accessible state to query directly;
    // we verify by pressing it and confirming router.push is NOT called)
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('Next button is disabled when phone is invalid', () => {
    renderRegister();
    fireEvent.changeText(screen.getByPlaceholderText('Jane'), 'Alice');
    fireEvent.changeText(screen.getByPlaceholderText('Smith'), 'Martin');
    // Type something that triggers isValid=false
    fireEvent.changeText(screen.getByTestId('phone-input'), 'BAD_PHONE');
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('Next button navigates when phone is valid', () => {
    renderRegister();
    fireEvent.changeText(screen.getByPlaceholderText('Jane'), 'Alice');
    fireEvent.changeText(screen.getByPlaceholderText('Smith'), 'Martin');
    // Type magic value that triggers isValid=true in the mock
    fireEvent.changeText(screen.getByTestId('phone-input'), 'VALID');
    fireEvent.press(screen.getByText('Next'));
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/(auth)/password-create',
        params: expect.objectContaining({
          email: 'test@example.com',
          first_name: 'Alice',
          last_name: 'Martin',
          phone_e164: '+21620123456',
        }),
      })
    );
  });
});
