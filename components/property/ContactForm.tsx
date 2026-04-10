import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSendInquiry } from '@/hooks/useSendInquiry';

interface ContactFormProps {
  propertyId: number | string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_MESSAGE = "Hi, I'm interested in this property. Could you please provide more information?";

export function ContactForm({ propertyId, onSuccess, onError }: ContactFormProps) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const { mutate, isPending } = useSendInquiry(propertyId);

  function handleSend() {
    if (!message.trim()) return;
    mutate(
      { body: message.trim() },
      {
        onSuccess: () => onSuccess?.(),
        onError: (err) => onError?.(err),
      }
    );
  }

  return (
    <View>
      <Text className="text-sm text-gray-500 mb-2">Message</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white min-h-[120px]"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
        placeholder="Write your message..."
        accessibilityLabel="Inquiry message"
      />

      <TouchableOpacity
        className={`mt-4 rounded-xl py-3.5 items-center ${isPending || !message.trim() ? 'bg-blue-300' : 'bg-blue-600'}`}
        onPress={handleSend}
        disabled={isPending || !message.trim()}
        accessibilityRole="button"
        accessibilityLabel="Send inquiry"
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Send Message</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
