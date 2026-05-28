import { View, Text, StyleSheet } from 'react-native';
import { scorePassword } from '@/lib/utils/password';
import { colors, radius, fontWeight } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

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

type StrengthScore = 'weak' | 'good' | 'excellent';

const SCORE_CONFIG: Record<StrengthScore, { label: string; filledSegments: number; segmentColor: string; labelColor: string }> = {
  weak: {
    label: 'Weak',
    filledSegments: 1,
    segmentColor: colors.error,
    labelColor: colors.error,
  },
  good: {
    label: 'Good',
    filledSegments: 2,
    segmentColor: colors.warning,
    labelColor: colors.warning,
  },
  excellent: {
    label: 'Excellent',
    filledSegments: 3,
    segmentColor: colors.success,
    labelColor: colors.success,
  },
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const score = scorePassword(password);
  const config = SCORE_CONFIG[score];
  const rules = getRules(password);

  return (
    <View style={styles.container}>
      {/* Strength bar */}
      <View style={styles.barRow}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < config.filledSegments ? config.segmentColor : colors.border },
            ]}
          />
        ))}
      </View>

      {/* Label */}
      <Text style={[styles.scoreLabel, { color: config.labelColor }]}>
        {config.label}
      </Text>

      {/* Rule checklist */}
      <View style={styles.rulesList}>
        {rules.map((rule) => (
          <View key={rule.label} style={styles.ruleRow}>
            <View accessible accessibilityLabel={rule.met ? `${rule.label} met` : `${rule.label} not met`}>
              <Icon
                name="check"
                size={14}
                color={rule.met ? colors.success : colors.textTertiary}
              />
            </View>
            <Text style={[styles.ruleText, { color: rule.met ? colors.textSecondary : colors.textTertiary }]}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    marginBottom: 8,
  },
  rulesList: {
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontSize: 14,
  },
});
