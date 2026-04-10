import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  type ListRenderItemInfo,
} from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useCountries, type CountryPublicResponse } from '@/hooks/useCountries';

function countryCodeToFlag(code: string): string {
  // Each letter maps to a Unicode regional indicator symbol
  // 'A' = 0x1F1E6, 'Z' = 0x1F1FF
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');
}

interface CountrySelectorProps {
  selectedCode?: string;
  onSelect: (country_code: string) => void;
}

export function CountrySelector({ selectedCode, onSelect }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: countries, isLoading } = useCountries();

  const displayCode = selectedCode ?? '??';
  const flag = selectedCode ? countryCodeToFlag(selectedCode) : '🌐';

  function handleSelect(code: string) {
    onSelect(code);
    setOpen(false);
  }

  function renderItem({ item }: ListRenderItemInfo<CountryPublicResponse>) {
    const itemFlag = countryCodeToFlag(item.country_code);
    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
        onPress={() => handleSelect(item.country_code)}
        accessibilityLabel={`Select ${item.name}`}
      >
        <Text className="text-2xl mr-3">{itemFlag}</Text>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.currency}</Text>
        </View>
        <Text className="text-sm text-gray-400 font-mono">{item.country_code}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg"
        onPress={() => setOpen(true)}
        disabled={isLoading}
        accessibilityLabel="Select country"
      >
        <Text className="text-lg mr-1">{flag}</Text>
        <Text className="text-sm font-semibold text-gray-700">{displayCode}</Text>
      </TouchableOpacity>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        snapPoints={['70%']}
      >
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 px-4 py-3 border-b border-gray-200">
            Select Country
          </Text>
          <FlatList
            data={countries ?? []}
            keyExtractor={(item) => item.country_code}
            renderItem={renderItem}
          />
        </View>
      </BottomSheet>
    </>
  );
}
