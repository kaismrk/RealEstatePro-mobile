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
} from 'react-native';
import { useTopLevelRegions, useChildRegions, type Region } from '@/hooks/useRegions';

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
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        accessibilityState={{ disabled }}
        className={`flex-row items-center justify-between border rounded-xl px-4 py-3 ${
          disabled
            ? 'bg-gray-50 border-gray-200'
            : selectedName
            ? 'bg-white border-blue-500'
            : 'bg-white border-gray-300'
        }`}
      >
        <Text
          className={`text-base flex-1 ${
            disabled
              ? 'text-gray-300'
              : selectedName
              ? 'text-gray-900 font-medium'
              : 'text-gray-400'
          }`}
          numberOfLines={1}
        >
          {selectedName ?? placeholder}
        </Text>
        <Text className={`ml-2 text-lg ${disabled ? 'text-gray-200' : 'text-gray-500'}`}>
          {'\u25BE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="px-3 py-1"
            >
              <Text className="text-blue-600 font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 py-3 border-b border-gray-100">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${title.toLowerCase()}…`}
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 rounded-xl px-4 py-2 text-base text-gray-900"
              accessibilityLabel={`Search ${title}`}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          {/* List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center" testID="region-loading">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : filtered.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-gray-400 text-base text-center">
                {items.length === 0
                  ? 'No regions available for this country yet.'
                  : 'No results match your search.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingVertical: 4 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setQuery('');
                    onSelect(item);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  className="flex-row items-center px-4 py-4 border-b border-gray-50"
                >
                  <Text className="text-base text-gray-900 flex-1">{item.name}</Text>
                  {item.code ? (
                    <Text className="text-xs text-gray-400 ml-2">{item.code}</Text>
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
    // Reset parent onChange since selection is not complete
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
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-gray-800">Location</Text>
        {hasAnySelection && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear location selection"
          >
            <Text className="text-sm text-blue-600 font-medium">Clear</Text>
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
