import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSendInquiry } from '@/hooks/useSendInquiry';
import { colors, radius, fontWeight } from '@/constants/theme';

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

  const isDisabled = isPending || !message.trim();

  return (
    <View>
      <Text style={styles.label}>Message</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
        placeholder="Write your message..."
        accessibilityLabel="Inquiry message"
      />

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel="Send inquiry"
      >
        {isPending ? (
          <ActivityIndicator color={colors.textOnBrand} />
        ) : (
          <Text style={styles.buttonText}>Send Message</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  button: {
    marginTop: 16,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
});
