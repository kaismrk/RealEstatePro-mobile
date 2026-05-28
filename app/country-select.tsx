import { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCountries, type CountryPublicResponse } from '@/hooks/useCountries';
import { colors, fontWeight, radius } from '@/constants/theme';

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
        style={styles.countryRow}
        onPress={() => void handleSelect(item.country_code)}
        accessibilityLabel={`Select ${item.name}`}
      >
        <Text style={styles.flag}>{flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.currency}>{item.currency}</Text>
        </View>
        <Text style={styles.countryCode}>{item.country_code}</Text>
      </TouchableOpacity>
    );
  }

  if (isLoading || detecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Detecting your country...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Select your country</Text>
        <Text style={styles.subtitle}>
          Choose the market you want to browse
        </Text>
      </View>

      <FlatList
        data={countries ?? []}
        keyExtractor={(item) => item.country_code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  currency: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countryCode: {
    fontSize: 14,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
});
