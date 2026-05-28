import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';

interface MortgageCalculatorProps {
  price: number;
}

/**
 * PMT formula: monthly payment for a fixed-rate mortgage.
 * PMT = P * (r * (1+r)^n) / ((1+r)^n - 1)
 * where:
 *   P = principal (price - down payment)
 *   r = monthly interest rate (annualRate / 100 / 12)
 *   n = term in months (years * 12)
 */
function calculateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (principal <= 0 || annualRatePercent <= 0 || termYears <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  const pmt = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  return isFinite(pmt) ? pmt : 0;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [termYears, setTermYears] = useState('25');
  const [interestRate, setInterestRate] = useState('5');

  const downPct = parseFloat(downPaymentPct) || 0;
  const years = parseFloat(termYears) || 0;
  const rate = parseFloat(interestRate) || 0;

  const downPayment = price * (downPct / 100);
  const principal = Math.max(0, price - downPayment);
  const monthly = calculateMonthlyPayment(principal, rate, years);

  function formatAmount(n: number): string {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mortgage Calculator</Text>

      {/* Property Price (readonly) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Property Price</Text>
        <View style={styles.readonlyField}>
          <Text style={styles.readonlyText}>{formatAmount(price)}</Text>
        </View>
      </View>

      {/* Down Payment */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Down Payment (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={downPaymentPct}
          onChangeText={setDownPaymentPct}
          placeholder="20"
          accessibilityLabel="Down payment percentage"
        />
        {downPct > 0 && (
          <Text style={styles.hint}>= {formatAmount(downPayment)}</Text>
        )}
      </View>

      {/* Loan Term */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Loan Term (years)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={termYears}
          onChangeText={setTermYears}
          placeholder="25"
          accessibilityLabel="Loan term in years"
        />
      </View>

      {/* Interest Rate */}
      <View style={styles.fieldGroupLast}>
        <Text style={styles.fieldLabel}>Annual Interest Rate (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={interestRate}
          onChangeText={setInterestRate}
          placeholder="5"
          accessibilityLabel="Annual interest rate"
        />
      </View>

      {/* Result */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Estimated Monthly Payment</Text>
        <Text style={styles.resultAmount}>
          {monthly > 0 ? formatAmount(monthly) : '—'}
        </Text>
        <Text style={styles.resultPrincipal}>
          Principal: {formatAmount(principal)}
        </Text>
      </View>

      <Text style={styles.disclaimer}>
        Estimate only. Consult a financial advisor for accurate figures.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl2,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldGroupLast: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  readonlyField: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readonlyText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: colors.primaryLight,
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.textOnBrand,
  },
  resultPrincipal: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
});
