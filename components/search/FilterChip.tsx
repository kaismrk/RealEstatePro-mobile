import { TouchableOpacity, Text, View } from 'react-native';

interface FilterChipProps {
  label: string;
  onDismiss: () => void;
}

export function FilterChip({ label, onDismiss }: FilterChipProps) {
  return (
    <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mr-2">
      <Text className="text-sm text-blue-700 font-medium mr-1">{label}</Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Remove filter: ${label}`}
        accessibilityRole="button"
      >
        <Text className="text-sm text-blue-500 font-bold">✕</Text>
      </TouchableOpacity>
    </View>
  );
}
