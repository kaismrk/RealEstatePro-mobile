import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthGate } from '@/components/auth/AuthGate';
import { ContactForm } from '@/components/property/ContactForm';
import { useProperty } from '@/hooks/useProperty';

function ContactContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property } = useProperty(id);

  function handleSuccess() {
    Toast.show({
      type: 'success',
      text1: 'Message sent',
      text2: 'The agent will get back to you soon.',
    });
    router.back();
  }

  function handleError(error: Error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to send',
      text2: error.message,
    });
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text className="text-gray-600 text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-gray-900 text-center">
          Contact Agent
        </Text>
        {/* Spacer to balance the Cancel text */}
        <View className="w-14" />
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        {property && (
          <View className="mb-4 bg-gray-50 rounded-xl p-3">
            <Text className="text-xs text-gray-500 mb-0.5">About</Text>
            <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
              {property.title}
            </Text>
            <Text className="text-xs text-gray-500">{property.city}</Text>
          </View>
        )}

        <ContactForm
          propertyId={id}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

export default function ContactScreen() {
  return (
    <AuthGate>
      <ContactContent />
    </AuthGate>
  );
}
