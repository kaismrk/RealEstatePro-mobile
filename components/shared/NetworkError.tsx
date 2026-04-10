import { View, Text, TouchableOpacity } from 'react-native';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-4xl mb-4">{'\uD83D\uDCF5'}</Text>
      <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
        Connection error
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        {message ?? 'Unable to load data. Check your connection and try again.'}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-600 px-6 py-3 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text className="text-white font-semibold text-base">Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
