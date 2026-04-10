import { View, Text } from 'react-native';
import { scorePassword } from '@/lib/utils/password';

interface PasswordStrengthMeterProps {
  password: string;
}

interface Rule {
  label: string;
  met: boolean;
}

function getRules(password: string): Rule[] {
  return [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
  ];
}

const SCORE_CONFIG = {
  weak: {
    label: 'Weak',
    filledSegments: 1,
    activeColor: 'bg-red-500',
  },
  good: {
    label: 'Good',
    filledSegments: 2,
    activeColor: 'bg-orange-400',
  },
  excellent: {
    label: 'Excellent',
    filledSegments: 3,
    activeColor: 'bg-green-500',
  },
} as const;

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const score = scorePassword(password);
  const config = SCORE_CONFIG[score];
  const rules = getRules(password);

  return (
    <View className="mt-2 mb-4">
      {/* Strength bar */}
      <View className="flex-row gap-1 mb-2">
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            className={`flex-1 h-1.5 rounded-full ${
              index < config.filledSegments ? config.activeColor : 'bg-gray-200'
            }`}
          />
        ))}
      </View>

      {/* Label */}
      <Text
        className={`text-sm font-semibold mb-2 ${
          score === 'weak'
            ? 'text-red-500'
            : score === 'good'
            ? 'text-orange-400'
            : 'text-green-500'
        }`}
      >
        {config.label}
      </Text>

      {/* Rule checklist */}
      <View className="gap-1">
        {rules.map((rule) => (
          <View key={rule.label} className="flex-row items-center gap-1.5">
            <Text
              className={rule.met ? 'text-green-500' : 'text-gray-400'}
              accessibilityLabel={rule.met ? `${rule.label} met` : `${rule.label} not met`}
            >
              {rule.met ? '✓' : '✗'}
            </Text>
            <Text className={`text-sm ${rule.met ? 'text-gray-700' : 'text-gray-400'}`}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
