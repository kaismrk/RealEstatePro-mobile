/**
 * PhoneInput component tests.
 *
 * Uses real libphonenumber-js — no mock — so we test actual validation
 * behaviour. Known-valid TN number: +21620123456 (20 123 456 local).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PhoneInput } from '@/components/inputs/PhoneInput';
import type { PhoneValue } from '@/components/inputs/PhoneInput';

// ── helpers ──────────────────────────────────────────────────────────────────

function renderInput(overrides: Partial<React.ComponentProps<typeof PhoneInput>> = {}) {
  const onValueChange = jest.fn();
  const utils = render(
    <PhoneInput
      value=""
      onValueChange={onValueChange}
      {...overrides}
    />
  );
  return { ...utils, onValueChange };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('PhoneInput', () => {
  it('renders with default label and placeholder', () => {
    renderInput();
    expect(screen.getByText('Phone number')).toBeTruthy();
    expect(screen.getByPlaceholderText('+216 12 345 678')).toBeTruthy();
  });

  it('does not show inline error when the field is empty even after blur', () => {
    renderInput({ value: '' });
    const input = screen.getByPlaceholderText('+216 12 345 678');
    fireEvent(input, 'blur');
    // "Invalid phone number" should NOT appear for an empty field
    expect(screen.queryByText('Invalid phone number')).toBeNull();
  });

  it('shows inline error after blur when number is malformed', () => {
    const { rerender, onValueChange } = renderInput({ value: '1234' });
    const input = screen.getByPlaceholderText('+216 12 345 678');
    fireEvent(input, 'blur');
    // After blur with invalid non-empty value, error should appear.
    // We need to rerender with the same value and touched=true (simulated by blur).
    rerender(
      <PhoneInput
        value="1234"
        onValueChange={onValueChange}
      />
    );
    // Trigger blur on the rendered component to set touched state
    fireEvent(screen.getByPlaceholderText('+216 12 345 678'), 'blur');
    expect(screen.getByText('Invalid phone number')).toBeTruthy();
  });

  it('calls onValueChange with isValid=true for a valid TN number', () => {
    const { onValueChange } = renderInput({ value: '' });
    const input = screen.getByPlaceholderText('+216 12 345 678');
    // Type a valid TN number (+216 20 123 456)
    fireEvent.changeText(input, '+21620123456');
    const lastCall: PhoneValue = onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0];
    expect(lastCall.isValid).toBe(true);
    expect(lastCall.e164).toBe('+21620123456');
  });

  it('calls onValueChange with isValid=false for malformed input', () => {
    const { onValueChange } = renderInput({ value: '' });
    const input = screen.getByPlaceholderText('+216 12 345 678');
    fireEvent.changeText(input, '1234');
    const lastCall: PhoneValue = onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0];
    expect(lastCall.isValid).toBe(false);
    expect(lastCall.e164).toBe('');
  });

  it('respects an external error prop (overrides internal inline error)', () => {
    renderInput({ value: '', error: 'Custom external error' });
    expect(screen.getByText('Custom external error')).toBeTruthy();
  });
});
