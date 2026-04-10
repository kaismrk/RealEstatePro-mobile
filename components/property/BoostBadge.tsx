import { View, Text } from 'react-native';

interface BoostBadgeProps {
  label?: string;
}

export function BoostBadge({ label = 'Featured' }: BoostBadgeProps) {
  return (
    <View className="bg-amber-400 rounded-full px-2 py-0.5">
      <Text className="text-xs font-bold text-white">{label}</Text>
    </View>
  );
}
