import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { MenuRow } from '@/components/profile/MenuRow';

const APP_VERSION =
  (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
      <Text className="text-base text-gray-800">{label}</Text>
      <Text className="text-base text-gray-500">{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const countryCode = useAuthStore((s) => s.countryCode);
  const setCountry = useAuthStore((s) => s.setCountry);
  const logout = useLogout();

  function handleCountrySelect(code: string) {
    void setCountry(code);
    queryClient.clear();
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout.mutate(),
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">App Settings</Text>
      </View>

      {/* Region */}
      <View className="mt-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
          Region
        </Text>
        <View className="bg-white border-t border-gray-100">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-base text-gray-800">Country</Text>
            <CountrySelector selectedCode={countryCode} onSelect={handleCountrySelect} />
          </View>
          <SettingsRow label="Language" value="English" />
          <SettingsRow label="Theme" value="Light" />
        </View>
      </View>

      {/* About */}
      <View className="mt-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
          About
        </Text>
        <View className="bg-white border-t border-gray-100">
          <SettingsRow label="App Version" value={APP_VERSION} />
          <MenuRow
            icon="📄"
            label="Terms of Use"
            onPress={() => void Linking.openURL('https://example.com/terms')}
          />
          <MenuRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => void Linking.openURL('https://example.com/privacy')}
          />
          <MenuRow
            icon="📦"
            label="Open-Source Licenses"
            onPress={() => void Linking.openURL('https://example.com/licenses')}
          />
        </View>
      </View>

      {/* Sign out */}
      <View className="mt-6 mb-8">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
          Account Actions
        </Text>
        <View className="bg-white border-t border-gray-100">
          <MenuRow
            icon="🚪"
            label="Sign Out"
            onPress={handleSignOut}
            destructive
          />
        </View>
      </View>
    </ScrollView>
  );
}
