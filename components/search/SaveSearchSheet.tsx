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
} from 'react-native';
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

    // Build filters matching SavedSearchFilters schema
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
    // Reset name for next time
    setName(buildDefaultName(filters.q ?? undefined));
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Title row */}
          <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900 flex-1">
              Save Search
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text className="text-gray-600">{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 pt-6 gap-6">
            {/* Search name input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Search Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Search in Tunis"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                maxLength={120}
                returnKeyType="done"
                accessibilityLabel="Search name input"
              />
            </View>

            {/* Email notifications toggle */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-1 mr-4">
                <Text className="text-base font-medium text-gray-900">
                  Email Notifications
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Get notified when new homes match this search
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={emailNotifications ? '#2563EB' : '#F3F4F6'}
                accessibilityLabel="Email notifications toggle"
              />
            </View>

            {/* Active filter summary */}
            {Object.keys(filters).length > 0 && (
              <View className="bg-primary-50 rounded-xl p-3">
                <Text className="text-xs font-semibold text-primary-700 mb-1">
                  Current Filters
                </Text>
                {Object.entries(filters)
                  .filter(([, v]) => v != null && v !== '')
                  .map(([key, value]) => (
                    <Text key={key} className="text-xs text-primary-500">
                      {key}: {String(value)}
                    </Text>
                  ))}
              </View>
            )}
          </View>

          {/* Save button */}
          <View className="px-4 mt-auto pb-6">
            <TouchableOpacity
              onPress={handleSave}
              disabled={create.isPending || !name.trim()}
              className={`py-4 rounded-xl items-center ${
                create.isPending || !name.trim()
                  ? 'bg-gray-300'
                  : 'bg-primary-500'
              }`}
              accessibilityRole="button"
              accessibilityLabel="Save search"
              accessibilityState={{ disabled: create.isPending || !name.trim() }}
            >
              <Text
                className={`text-base font-semibold ${
                  create.isPending || !name.trim()
                    ? 'text-gray-500'
                    : 'text-white'
                }`}
              >
                {create.isPending ? 'Saving...' : 'Save Search'}
              </Text>
            </TouchableOpacity>

            {create.isError && (
              <Text className="text-red-500 text-sm text-center mt-2">
                Failed to save. Please try again.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
