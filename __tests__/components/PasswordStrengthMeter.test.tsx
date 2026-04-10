import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders "Weak" label for a weak password', () => {
    render(<PasswordStrengthMeter password="abc" />);
    expect(screen.getByText('Weak')).toBeTruthy();
  });

  it('renders "Good" label for a good password', () => {
    render(<PasswordStrengthMeter password="Abc12345" />);
    expect(screen.getByText('Good')).toBeTruthy();
  });

  it('renders "Excellent" label for an excellent password', () => {
    render(<PasswordStrengthMeter password="Abc123456789" />);
    expect(screen.getByText('Excellent')).toBeTruthy();
  });

  it('shows all rule labels', () => {
    render(<PasswordStrengthMeter password="abc" />);
    expect(screen.getByText('8+ characters')).toBeTruthy();
    expect(screen.getByText('Uppercase letter')).toBeTruthy();
    expect(screen.getByText('Lowercase letter')).toBeTruthy();
    expect(screen.getByText('Number')).toBeTruthy();
  });

  it('marks "Lowercase letter" as met for "abc"', () => {
    render(<PasswordStrengthMeter password="abc" />);
    // accessibilityLabel distinguishes met vs not-met
    expect(screen.getByLabelText('Lowercase letter met')).toBeTruthy();
    expect(screen.getByLabelText('8+ characters not met')).toBeTruthy();
    expect(screen.getByLabelText('Uppercase letter not met')).toBeTruthy();
    expect(screen.getByLabelText('Number not met')).toBeTruthy();
  });

  it('marks all rules as met for an excellent password', () => {
    render(<PasswordStrengthMeter password="Abc123456789" />);
    expect(screen.getByLabelText('8+ characters met')).toBeTruthy();
    expect(screen.getByLabelText('Uppercase letter met')).toBeTruthy();
    expect(screen.getByLabelText('Lowercase letter met')).toBeTruthy();
    expect(screen.getByLabelText('Number met')).toBeTruthy();
  });
});
