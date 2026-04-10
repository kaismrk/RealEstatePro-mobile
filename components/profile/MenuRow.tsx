import { TouchableOpacity, View, Text } from 'react-native';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  accessibilityLabel?: string;
}

export function MenuRow({
  icon,
  label,
  onPress,
  badge,
  destructive = false,
  accessibilityLabel,
}: MenuRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text
        className={`flex-1 text-base ${destructive ? 'text-red-600 font-medium' : 'text-gray-800'}`}
      >
        {label}
      </Text>
      <View className="flex-row items-center">
        {badge !== undefined && badge > 0 ? (
          <View className="bg-blue-600 rounded-full px-2 py-0.5 min-w-5 items-center mr-2">
            <Text className="text-white text-xs font-semibold">{badge}</Text>
          </View>
        ) : null}
        <Text className="text-gray-400 text-base">›</Text>
      </View>
    </TouchableOpacity>
  );
}
