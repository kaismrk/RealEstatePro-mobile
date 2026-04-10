import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

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
    <View className="mb-6 bg-blue-50 rounded-2xl p-4">
      <Text className="text-lg font-bold text-gray-900 mb-4">Mortgage Calculator</Text>

      {/* Property Price (readonly) */}
      <View className="mb-3">
        <Text className="text-xs text-gray-500 mb-1">Property Price</Text>
        <View className="bg-gray-100 rounded-xl px-3 py-2.5">
          <Text className="text-sm font-semibold text-gray-700">{formatAmount(price)}</Text>
        </View>
      </View>

      {/* Down Payment */}
      <View className="mb-3">
        <Text className="text-xs text-gray-500 mb-1">Down Payment (%)</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
          keyboardType="decimal-pad"
          value={downPaymentPct}
          onChangeText={setDownPaymentPct}
          placeholder="20"
          accessibilityLabel="Down payment percentage"
        />
        {downPct > 0 && (
          <Text className="text-xs text-gray-400 mt-0.5">= {formatAmount(downPayment)}</Text>
        )}
      </View>

      {/* Loan Term */}
      <View className="mb-3">
        <Text className="text-xs text-gray-500 mb-1">Loan Term (years)</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
          keyboardType="number-pad"
          value={termYears}
          onChangeText={setTermYears}
          placeholder="25"
          accessibilityLabel="Loan term in years"
        />
      </View>

      {/* Interest Rate */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Annual Interest Rate (%)</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
          keyboardType="decimal-pad"
          value={interestRate}
          onChangeText={setInterestRate}
          placeholder="5"
          accessibilityLabel="Annual interest rate"
        />
      </View>

      {/* Result */}
      <View className="bg-blue-600 rounded-xl p-4 items-center">
        <Text className="text-xs text-blue-100 mb-1">Estimated Monthly Payment</Text>
        <Text className="text-2xl font-bold text-white">
          {monthly > 0 ? formatAmount(monthly) : '—'}
        </Text>
        <Text className="text-xs text-blue-200 mt-0.5">
          Principal: {formatAmount(principal)}
        </Text>
      </View>

      <Text className="text-xs text-gray-400 mt-2 text-center">
        Estimate only. Consult a financial advisor for accurate figures.
      </Text>
    </View>
  );
}
