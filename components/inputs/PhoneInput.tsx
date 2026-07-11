import { useState } from 'react';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';

export interface PhoneValue {
  /** Formatted display string (e.g. "+216 20 123 456") */
  raw: string;
  /** E.164 format (e.g. "+21620123456") — empty string if not valid yet */
  e164: string;
  /** Whether the number passes libphonenumber-js isValid() check */
  isValid: boolean;
}

interface PhoneInputProps {
  /** Field label. Defaults to t('common.phone.label'). */
  label?: string;
  /**
   * ISO 2-letter country code used for local-number parsing and formatting.
   * Defaults to 'TN' (Tunisia, +216).
   */
  countryCode?: string;
  /** Controlled display value (the `raw` from the last onValueChange). */
  value: string;
  /** Emits parsed result on every keystroke and on blur. */
  onValueChange: (val: PhoneValue) => void;
  /** External error message (overrides the internal inline validation error). */
  error?: string;
  containerStyle?: ViewStyle;
}

function parseValue(text: string, cc: CountryCode): PhoneValue {
  const parsed = parsePhoneNumberFromString(text, cc);
  return {
    raw: text,
    e164: parsed?.isValid() ? (parsed.format('E.164') ?? '') : '',
    isValid: parsed?.isValid() ?? false,
  };
}

export function PhoneInput({
  label,
  countryCode = 'TN',
  value,
  onValueChange,
  error,
  containerStyle,
}: PhoneInputProps) {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);

  const cc = countryCode as CountryCode;

  const isEmpty = !value.trim();
  const showInlineError = touched && !isEmpty && !(parsePhoneNumberFromString(value, cc)?.isValid() ?? false);
  const displayError = error ?? (showInlineError ? t('common.phone.invalid') : undefined);

  function handleChangeText(text: string) {
    // Strip everything except digits and a leading +
    const stripped = text.replace(/[^\d+]/g, '');
    // Reformat using AsYouType — this handles both local (e.g. "20 123 456")
    // and international (e.g. "+216 20 123 456") input patterns.
    const formatted = new AsYouType(cc).input(stripped);

    const parsed = parsePhoneNumberFromString(stripped, cc);
    onValueChange({
      raw: formatted,
      e164: parsed?.isValid() ? (parsed.format('E.164') ?? '') : '',
      isValid: parsed?.isValid() ?? false,
    });
  }

  function handleBlur() {
    setTouched(true);
    // Re-emit on blur so the parent always has the final parsed state.
    onValueChange(parseValue(value, cc));
  }

  return (
    <Input
      label={label ?? t('common.phone.label')}
      value={value}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      error={displayError}
      placeholder={t('common.phone.placeholder')}
      keyboardType="phone-pad"
      autoComplete="tel"
      textContentType="telephoneNumber"
      containerStyle={containerStyle}
    />
  );
}
