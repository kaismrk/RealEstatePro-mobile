import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AuthGate } from '@/components/auth/AuthGate';

interface NotificationToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  value,
  onValueChange,
}: NotificationToggleProps) {
  return (
    <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
      <View className="flex-1 mr-3">
        <Text className="text-base text-gray-800">{label}</Text>
        {description ? (
          <Text className="text-xs text-gray-400 mt-0.5">{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function NotificationsContent() {
  const [matchingListings, setMatchingListings] = useState(false);
  const [inquiries, setInquiries] = useState(false);
  const [priceChanges, setPriceChanges] = useState(false);
  const [appNews, setAppNews] = useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Notifications</Text>
      </View>

      {/* Coming soon banner */}
      <View className="mx-4 mt-4 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
        <Text className="text-sm text-primary-700 font-medium">Coming soon</Text>
        <Text className="text-xs text-primary-500 mt-0.5">
          Push notification preferences will be available in a future update.
        </Text>
      </View>

      {/* Toggles (UI-only, no backend) */}
      <View className="mt-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
          Push Notifications
        </Text>
        <View className="bg-white border-t border-gray-100">
          <NotificationToggle
            label="New matching listings"
            description="Alerts when new listings match your saved searches"
            value={matchingListings}
            onValueChange={setMatchingListings}
          />
          <NotificationToggle
            label="New inquiries on your listings"
            description="When someone contacts you about a listing"
            value={inquiries}
            onValueChange={setInquiries}
          />
          <NotificationToggle
            label="Price changes on saved homes"
            description="When a price drops on a property you saved"
            value={priceChanges}
            onValueChange={setPriceChanges}
          />
          <NotificationToggle
            label="App news & updates"
            description="Feature announcements and tips"
            value={appNews}
            onValueChange={setAppNews}
          />
        </View>
      </View>

      {/* Static email note */}
      <View className="mx-4 mt-4 mb-8">
        <Text className="text-xs text-gray-400 text-center">
          Email notifications for saved search alerts are already active.
        </Text>
      </View>
    </ScrollView>
  );
}

export default function NotificationsScreen() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}
