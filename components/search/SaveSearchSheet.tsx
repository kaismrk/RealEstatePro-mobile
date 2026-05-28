import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useSearchStore } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';

interface SaveSearchSheetProps {
  visible: boolean;
  onClose: () => void;
}

function buildDefaultName(city?: string): string {
  if (city) return `Search in ${city}`;
  return 'My Saved Search';
}

export function SaveSearchSheet({ visible, onClose }: SaveSearchSheetProps) {
  const filters = useSearchStore((s) => s.filters);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { create } = useSavedSearches();

  const [name, setName] = useState(buildDefaultName(filters.q ?? undefined));
  const [emailNotifications, setEmailNotifications] = useState(true);

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const payload = {
      name: trimmedName,
      filters: {
        listing_type: filters.listing_type ?? undefined,
        property_type: filters.property_type ?? undefined,
        min_price: filters.min_price ?? undefined,
        max_price: filters.max_price ?? undefined,
        min_bedrooms: filters.min_bedrooms ?? undefined,
        max_bedrooms: filters.max_bedrooms ?? undefined,
        min_area: filters.min_area ?? undefined,
        max_area: filters.max_area ?? undefined,
        city: filters.q ?? undefined,
      },
      country_code: countryCode,
    };

    create.mutate(payload, {
      onSuccess: () => {
        void haptic.success();
        onClose();
      },
      onError: () => {
        void haptic.error();
      },
    });
  }

  function handleClose() {
    onClose();
    setName(buildDefaultName(filters.q ?? undefined));
  }

  if (!visible) return null;

  const saveDisabled = create.isPending || !name.trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>Save Search</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Icon name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View>
              <Text style={styles.fieldLabel}>Search Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Search in Tunis"
                placeholderTextColor={colors.textTertiary}
                style={styles.input}
                maxLength={120}
                returnKeyType="done"
                accessibilityLabel="Search name input"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Email Notifications</Text>
                <Text style={styles.toggleSub}>
                  Get notified when new homes match this search
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.borderStrong, true: colors.borderBrand }}
                thumbColor={emailNotifications ? colors.primary : '#f5f5f7'}
                accessibilityLabel="Email notifications toggle"
              />
            </View>

            {Object.keys(filters).length > 0 && (
              <View style={styles.filterCard}>
                <Text style={styles.filterCardTitle}>Current Filters</Text>
                {Object.entries(filters)
                  .filter(([, v]) => v != null && v !== '')
                  .map(([key, value]) => (
                    <Text key={key} style={styles.filterCardRow}>
                      {key}: {String(value)}
                    </Text>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saveDisabled}
              style={[styles.saveBtn, saveDisabled && styles.saveBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Save search"
              accessibilityState={{ disabled: saveDisabled }}
            >
              <Text style={[styles.saveBtnText, saveDisabled && styles.saveBtnTextDisabled]}>
                {create.isPending ? 'Saving...' : 'Save Search'}
              </Text>
            </TouchableOpacity>

            {create.isError && (
              <Text style={styles.errorText}>Failed to save. Please try again.</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: fontWeight.bold, color: colors.textPrimary, flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surfaceSunken,
  },
  body: { paddingHorizontal: 16, paddingTop: 24, gap: 24 },
  fieldLabel: { fontSize: 13, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSunken,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleInfo: { flex: 1, marginRight: 16 },
  toggleTitle: { fontSize: 15, fontWeight: fontWeight.medium, color: colors.textPrimary },
  toggleSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  filterCard: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12 },
  filterCardTitle: { fontSize: 11, fontWeight: fontWeight.semibold, color: colors.primaryDark, marginBottom: 4 },
  filterCardRow: { fontSize: 12, color: colors.primary },
  footer: { paddingHorizontal: 16, marginTop: 'auto', paddingBottom: 24 },
  saveBtn: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.primary },
  saveBtnDisabled: { backgroundColor: colors.borderStrong },
  saveBtnText: { fontSize: 15, fontWeight: fontWeight.semibold, color: colors.textOnBrand },
  saveBtnTextDisabled: { color: colors.textSecondary },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center', marginTop: 8 },
});
