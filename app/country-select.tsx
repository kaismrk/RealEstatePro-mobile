import { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries, type CountryPublicResponse } from '@/hooks/useCountries';

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');
}

interface IpApiResponse {
  country_code: string;
}

export default function CountrySelectScreen() {
  const { data: countries, isLoading } = useCountries();
  const setCountry = useAuthStore((state) => state.setCountry);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const json = (await res.json()) as IpApiResponse;
        const detected = json.country_code?.toUpperCase();

        if (detected && countries) {
          const match = countries.find((c) => c.country_code === detected);
          if (match) {
            await setCountry(match.country_code);
            router.replace('/(auth)/welcome');
            return;
          }
        }
      } catch {
        // IP detection failed — show manual selector
      } finally {
        setDetecting(false);
      }
    }

    if (countries !== undefined) {
      void detectCountry();
    }
  }, [countries, setCountry]);

  async function handleSelect(code: string) {
    await setCountry(code);
    router.replace('/(auth)/welcome');
  }

  function renderItem({ item }: ListRenderItemInfo<CountryPublicResponse>) {
    const flag = countryCodeToFlag(item.country_code);
    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-4 border-b border-gray-100"
        onPress={() => void handleSelect(item.country_code)}
        accessibilityLabel={`Select ${item.name}`}
      >
        <Text className="text-2xl mr-4">{flag}</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.currency}</Text>
        </View>
        <Text className="text-sm text-gray-400 font-mono">{item.country_code}</Text>
      </TouchableOpacity>
    );
  }

  if (isLoading || detecting) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#006AFF" />
        <Text className="text-base text-gray-500 mt-4">Detecting your country...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Select your country</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Choose the market you want to browse
        </Text>
      </View>

      <FlatList
        data={countries ?? []}
        keyExtractor={(item) => item.country_code}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
