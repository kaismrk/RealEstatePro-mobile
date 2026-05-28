import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useCountries, type CountryPublicResponse } from '@/hooks/useCountries';
import { colors, radius, fontWeight } from '@/constants/theme';

function countryCodeToFlag(code: string): string {
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
        style={styles.listItem}
        onPress={() => handleSelect(item.country_code)}
        accessibilityLabel={`Select ${item.name}`}
      >
        <Text style={styles.listItemFlag}>{itemFlag}</Text>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <Text style={styles.listItemCurrency}>{item.currency}</Text>
        </View>
        <Text style={styles.listItemCode}>{item.country_code}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        disabled={isLoading}
        accessibilityLabel="Select country"
      >
        <Text style={styles.triggerFlag}>{flag}</Text>
        <Text style={styles.triggerCode}>{displayCode}</Text>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)} snapPoints={['70%']}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select Country</Text>
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

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.neutral100,
    borderRadius: radius.sm,
  },
  triggerFlag: { fontSize: 18, marginRight: 4 },
  triggerCode: { fontSize: 14, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  sheetContent: { flex: 1 },
  sheetTitle: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemFlag: { fontSize: 24, marginRight: 12 },
  listItemInfo: { flex: 1 },
  listItemName: { fontSize: 16, fontWeight: fontWeight.medium, color: colors.textPrimary },
  listItemCurrency: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  listItemCode: { fontSize: 12, color: colors.textTertiary, fontWeight: fontWeight.medium },
});
