/**
 * Phase F10 — Cascading region → department → city picker.
 *
 * Renders three stacked selector rows:
 *   1. Region (level: region) — always enabled when countryCode is set
 *   2. Department (level: department) — disabled until region selected
 *   3. City (level: city) — disabled until department selected
 *
 * Each row opens a modal with a searchable flat list.
 * On city selection: calls onChange(cityId, [regionObj, deptObj, cityObj]).
 * "Clear" button resets all selections.
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTopLevelRegions, useChildRegions, type Region } from '@/hooks/useRegions';
import { colors, radius, fontWeight } from '@/constants/theme';

export interface RegionPickerProps {
  /** ISO country code e.g. "TN" */
  countryCode: string;
  /** Currently selected leaf region id (city level), or null */
  value: number | null;
  /** Called when a city is selected with its id and the full path */
  onChange: (regionId: number | null, path: Region[]) => void;
}

type SheetLevel = 'region' | 'department' | 'city' | null;

interface SelectorRowProps {
  label: string;
  placeholder: string;
  selectedName: string | null;
  disabled: boolean;
  onPress: () => void;
  testID?: string;
}

function SelectorRow({ label, placeholder, selectedName, disabled, onPress, testID }: SelectorRowProps) {
  return (
    <View style={selectorStyles.container}>
      <Text style={selectorStyles.label}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        accessibilityState={{ disabled }}
        style={[
          selectorStyles.button,
          disabled
            ? selectorStyles.buttonDisabled
            : selectedName
            ? selectorStyles.buttonSelected
            : selectorStyles.buttonDefault,
        ]}
      >
        <Text
          style={[
            selectorStyles.buttonText,
            disabled
              ? selectorStyles.textDisabled
              : selectedName
              ? selectorStyles.textSelected
              : selectorStyles.textPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedName ?? placeholder}
        </Text>
        <Text style={[selectorStyles.chevron, disabled && selectorStyles.chevronDisabled]}>
          {'▾'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const selectorStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  buttonSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    flex: 1,
  },
  textPlaceholder: {
    color: colors.textTertiary,
  },
  textSelected: {
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  textDisabled: {
    color: colors.border,
  },
  chevron: {
    marginLeft: 8,
    fontSize: 18,
    color: colors.textTertiary,
  },
  chevronDisabled: {
    color: colors.border,
  },
});

interface RegionSheetProps {
  visible: boolean;
  title: string;
  items: Region[];
  isLoading: boolean;
  onSelect: (region: Region) => void;
  onClose: () => void;
}

function RegionSheet({ visible, title, items, isLoading, onSelect, onClose }: RegionSheetProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((r) => r.name.toLowerCase().includes(lower));
  }, [items, query]);

  function handleClose() {
    setQuery('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={sheetStyles.safeArea}>
        <KeyboardAvoidingView
          style={sheetStyles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.headerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={sheetStyles.doneButton}
            >
              <Text style={sheetStyles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={sheetStyles.searchContainer}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${title.toLowerCase()}…`}
              placeholderTextColor={colors.textTertiary}
              style={sheetStyles.searchInput}
              accessibilityLabel={`Search ${title}`}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          {/* List */}
          {isLoading ? (
            <View style={sheetStyles.centered} testID="region-loading">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={sheetStyles.emptyContainer}>
              <Text style={sheetStyles.emptyText}>
                {items.length === 0
                  ? 'No regions available for this country yet.'
                  : 'No results match your search.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={sheetStyles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setQuery('');
                    onSelect(item);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  style={sheetStyles.listItem}
                >
                  <Text style={sheetStyles.listItemText}>{item.name}</Text>
                  {item.code ? (
                    <Text style={sheetStyles.listItemCode}>{item.code}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  doneText: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
  },
  searchInput: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSunken,
  },
  listItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  listItemCode: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 8,
  },
});

export function RegionPicker({ countryCode, value: _value, onChange }: RegionPickerProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<Region | null>(null);
  const [openSheet, setOpenSheet] = useState<SheetLevel>(null);

  const regionsQuery = useTopLevelRegions(countryCode || null);
  const departmentsQuery = useChildRegions(selectedRegion?.id ?? null);
  const citiesQuery = useChildRegions(selectedDepartment?.id ?? null);

  const hasAnySelection = selectedRegion != null || selectedDepartment != null || selectedCity != null;

  function handleSelectRegion(region: Region) {
    setSelectedRegion(region);
    setSelectedDepartment(null);
    setSelectedCity(null);
    setOpenSheet(null);
    onChange(null, []);
  }

  function handleSelectDepartment(dept: Region) {
    setSelectedDepartment(dept);
    setSelectedCity(null);
    setOpenSheet(null);
    onChange(null, []);
  }

  function handleSelectCity(city: Region) {
    setSelectedCity(city);
    setOpenSheet(null);
    const path: Region[] = [
      ...(selectedRegion ? [selectedRegion] : []),
      ...(selectedDepartment ? [selectedDepartment] : []),
      city,
    ];
    onChange(city.id, path);
  }

  function handleClear() {
    setSelectedRegion(null);
    setSelectedDepartment(null);
    setSelectedCity(null);
    onChange(null, []);
  }

  return (
    <View>
      <View style={pickerStyles.headerRow}>
        <Text style={pickerStyles.locationLabel}>Location</Text>
        {hasAnySelection && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear location selection"
          >
            <Text style={pickerStyles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <SelectorRow
        label="Region"
        placeholder="Select a region"
        selectedName={selectedRegion?.name ?? null}
        disabled={false}
        onPress={() => setOpenSheet('region')}
        testID="region-selector"
      />

      <SelectorRow
        label="Department"
        placeholder="Select a department"
        selectedName={selectedDepartment?.name ?? null}
        disabled={selectedRegion == null}
        onPress={() => setOpenSheet('department')}
        testID="department-selector"
      />

      <SelectorRow
        label="City"
        placeholder="Select a city"
        selectedName={selectedCity?.name ?? null}
        disabled={selectedDepartment == null}
        onPress={() => setOpenSheet('city')}
        testID="city-selector"
      />

      {/* Region sheet */}
      <RegionSheet
        visible={openSheet === 'region'}
        title="Region"
        items={regionsQuery.data?.items ?? []}
        isLoading={regionsQuery.isLoading}
        onSelect={handleSelectRegion}
        onClose={() => setOpenSheet(null)}
      />

      {/* Department sheet */}
      <RegionSheet
        visible={openSheet === 'department'}
        title="Department"
        items={departmentsQuery.data?.items ?? []}
        isLoading={departmentsQuery.isLoading}
        onSelect={handleSelectDepartment}
        onClose={() => setOpenSheet(null)}
      />

      {/* City sheet */}
      <RegionSheet
        visible={openSheet === 'city'}
        title="City"
        items={citiesQuery.data?.items ?? []}
        isLoading={citiesQuery.isLoading}
        onSelect={handleSelectCity}
        onClose={() => setOpenSheet(null)}
      />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
