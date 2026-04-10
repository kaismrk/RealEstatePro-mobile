import { View, Text, Image, Linking, TouchableOpacity } from 'react-native';
import type { AgencyResponse } from '@/hooks/useAgencies';

interface AgencyHeaderProps {
  agency: AgencyResponse;
}

export function AgencyHeader({ agency }: AgencyHeaderProps) {
  const website = agency.social_links?.website ?? null;

  function handleWebsite() {
    if (website) {
      Linking.openURL(website).catch(() => {
        // Silently ignore if URL cannot be opened
      });
    }
  }

  return (
    <View className="items-center px-4 pt-6 pb-4 bg-white">
      {agency.logo_url ? (
        <Image
          source={{ uri: agency.logo_url }}
          className="w-24 h-24 rounded-2xl mb-3"
          resizeMode="cover"
          accessibilityLabel={`${agency.name} logo`}
        />
      ) : (
        <View className="w-24 h-24 rounded-2xl bg-blue-100 items-center justify-center mb-3">
          <Text className="text-5xl">🏢</Text>
        </View>
      )}

      <Text className="text-2xl font-bold text-gray-900 text-center mb-1">{agency.name}</Text>
      <Text className="text-sm text-gray-400 uppercase tracking-widest mb-3">
        {agency.country_code}
      </Text>

      {agency.description ? (
        <Text className="text-sm text-gray-600 text-center leading-5 mb-3">
          {agency.description}
        </Text>
      ) : null}

      {website ? (
        <TouchableOpacity
          onPress={handleWebsite}
          accessibilityRole="link"
          accessibilityLabel="Open agency website"
        >
          <Text className="text-blue-600 text-sm underline">{website}</Text>
        </TouchableOpacity>
      ) : null}

      {/* Social links row */}
      {agency.social_links && (
        <View className="flex-row gap-3 mt-2">
          {agency.social_links.facebook ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.facebook!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Facebook"
            >
              <Text className="text-blue-700 text-sm font-medium">Facebook</Text>
            </TouchableOpacity>
          ) : null}
          {agency.social_links.instagram ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.instagram!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Instagram"
            >
              <Text className="text-pink-500 text-sm font-medium">Instagram</Text>
            </TouchableOpacity>
          ) : null}
          {agency.social_links.twitter ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(agency.social_links!.twitter!).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="Twitter / X"
            >
              <Text className="text-gray-700 text-sm font-medium">X / Twitter</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}
