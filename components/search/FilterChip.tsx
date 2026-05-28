import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  onDismiss: () => void;
}

export function FilterChip({ label, onDismiss }: FilterChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Remove filter: ${label}`}
        style={styles.dismiss}
      >
        <Icon name="x" size={12} color={colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginRight: 4,
  },
  dismiss: { padding: 1 },
});
