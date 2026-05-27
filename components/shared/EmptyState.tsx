import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      {icon ? (
        <Text className="text-5xl mb-4">{icon}</Text>
      ) : null}
      <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-base text-gray-500 text-center mb-6">
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold text-base">
            {action.label}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
