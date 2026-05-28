import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthGate } from '@/components/auth/AuthGate';
import { ContactForm } from '@/components/property/ContactForm';
import { useProperty } from '@/hooks/useProperty';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Agent</Text>
        {/* Spacer to balance the Cancel text */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {property && (
          <View style={styles.propertyCard}>
            <Text style={styles.propertyCardLabel}>About</Text>
            <Text style={styles.propertyCardTitle} numberOfLines={2}>
              {property.title}
            </Text>
            <Text style={styles.propertyCardCity}>{property.city}</Text>
          </View>
        )}

        <ContactForm
          propertyId={id}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <View style={styles.bottomSpacer} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    marginRight: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 56,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  propertyCard: {
    marginBottom: 16,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 12,
  },
  propertyCardLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  propertyCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  propertyCardCity: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  bottomSpacer: {
    height: 32,
  },
});
