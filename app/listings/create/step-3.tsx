import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { Button } from '@/components/ui/Button';

type TabKey = 'specs' | 'amenities' | 'description';

const HEATING_OPTIONS = [
  { value: 'central', label: 'Central' },
  { value: 'individual', label: 'Individual' },
  { value: 'electric', label: 'Electric' },
  { value: 'gas', label: 'Gas' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'solar', label: 'Solar' },
  { value: 'wood', label: 'Wood' },
  { value: 'none', label: 'None' },
];

const AC_OPTIONS = [
  { value: 'split', label: 'Split' },
  { value: 'central', label: 'Central' },
  { value: 'portable', label: 'Portable' },
  { value: 'none', label: 'None' },
];

const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const KITCHEN_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'semi_open', label: 'Semi-open' },
  { value: 'american', label: 'American' },
];

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="–"
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
        accessibilityLabel={label}
      />
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 border-b border-gray-100"
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Text className="text-base text-gray-800">{label}</Text>
      <View
        className={`w-12 h-6 rounded-full ${value ? 'bg-primary-500' : 'bg-gray-300'} items-center justify-center`}
      >
        <View
          className={`w-5 h-5 rounded-full bg-white shadow ${
            value ? 'translate-x-3' : '-translate-x-3'
          }`}
        />
      </View>
    </TouchableOpacity>
  );
}

function SelectRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-full border ${
                value === opt.value
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-gray-300'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === opt.value }}
            >
              <Text
                className={`text-sm ${value === opt.value ? 'text-white' : 'text-gray-700'}`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function CreateStep3() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);

  const [activeTab, setActiveTab] = useState<TabKey>('specs');

  // Specs
  const [areaSqm, setAreaSqm] = useState<string>(
    draft?.area_sqm != null ? String(draft.area_sqm) : ''
  );
  const [lotSize, setLotSize] = useState<string>(
    draft?.lot_size != null ? String(draft.lot_size) : ''
  );
  const [rooms, setRooms] = useState<string>(
    draft?.number_of_rooms != null ? String(draft.number_of_rooms) : ''
  );
  const [bedrooms, setBedrooms] = useState<string>(
    draft?.bedrooms != null ? String(draft.bedrooms) : ''
  );
  const [bathrooms, setBathrooms] = useState<string>(
    draft?.bathrooms != null ? String(draft.bathrooms) : ''
  );
  const [floor, setFloor] = useState<string>(
    draft?.floor != null ? String(draft.floor) : ''
  );
  const [totalFloors, setTotalFloors] = useState<string>(
    draft?.total_floors != null ? String(draft.total_floors) : ''
  );
  const [yearBuilt, setYearBuilt] = useState<string>(
    draft?.year_built != null ? String(draft.year_built) : ''
  );

  // Amenities
  const [furnished, setFurnished] = useState<boolean>((draft?.furnished as boolean) ?? false);
  const [pool, setPool] = useState<boolean>((draft?.swimming_pool as boolean) ?? false);
  const [garden, setGarden] = useState<boolean>((draft?.garden as boolean) ?? false);
  const [balcony, setBalcony] = useState<boolean>((draft?.balcony as boolean) ?? false);
  const [lift, setLift] = useState<boolean>((draft?.lift as boolean) ?? false);
  const [garageSpots, setGarageSpots] = useState<string>(
    draft?.garage_spots != null ? String(draft.garage_spots) : ''
  );
  const [parkingSpots, setParkingSpots] = useState<string>(
    draft?.parking_spots != null ? String(draft.parking_spots) : ''
  );
  const [heating, setHeating] = useState<string>(
    (draft?.heating_system as string) ?? 'none'
  );
  const [ac, setAc] = useState<string>((draft?.air_conditioner as string) ?? 'none');
  const [energyRating, setEnergyRating] = useState<string>(
    (draft?.energy_rating as string) ?? ''
  );
  const [kitchenType, setKitchenType] = useState<string>(
    (draft?.kitchen_type as string) ?? 'closed'
  );

  // Description
  const [description, setDescription] = useState<string>(
    (draft?.description as string) ?? ''
  );

  function numOrNull(v: string): number | null {
    const n = Number(v);
    return v.trim() !== '' && !isNaN(n) ? n : null;
  }

  function handleNext() {
    setDraft({
      area_sqm: numOrNull(areaSqm),
      lot_size: numOrNull(lotSize),
      number_of_rooms: numOrNull(rooms),
      bedrooms: numOrNull(bedrooms),
      bathrooms: numOrNull(bathrooms),
      floor: numOrNull(floor),
      total_floors: numOrNull(totalFloors),
      year_built: numOrNull(yearBuilt),
      furnished,
      swimming_pool: pool,
      garden,
      balcony,
      lift,
      garage_spots: numOrNull(garageSpots),
      parking_spots: numOrNull(parkingSpots),
      heating_system: heating,
      air_conditioner: ac,
      energy_rating: energyRating || null,
      kitchen_type: kitchenType,
      description: description.trim() || null,
    });
    router.push('/listings/create/step-4');
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-primary-500 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Property Details</Text>
        <Text className="text-sm text-gray-500 mt-1">Step 3 of 5 — Specs &amp; Amenities</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 pt-3 border-b border-gray-100">
        {(['specs', 'amenities', 'description'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`mr-5 pb-2 ${
              activeTab === tab ? 'border-b-2 border-primary-500' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium capitalize ${
                activeTab === tab ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              {tab === 'specs' ? 'Specs' : tab === 'amenities' ? 'Amenities' : 'Description'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {activeTab === 'specs' && (
          <>
            <NumberInput label="Area (m²)" value={areaSqm} onChange={setAreaSqm} />
            <NumberInput label="Lot Size (m²)" value={lotSize} onChange={setLotSize} />
            <NumberInput label="Number of Rooms" value={rooms} onChange={setRooms} />
            <NumberInput label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
            <NumberInput label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
            <NumberInput label="Floor" value={floor} onChange={setFloor} />
            <NumberInput label="Total Floors" value={totalFloors} onChange={setTotalFloors} />
            <NumberInput label="Year Built" value={yearBuilt} onChange={setYearBuilt} />
          </>
        )}

        {activeTab === 'amenities' && (
          <>
            <ToggleRow label="Furnished" value={furnished} onToggle={() => setFurnished((v) => !v)} />
            <ToggleRow label="Swimming Pool" value={pool} onToggle={() => setPool((v) => !v)} />
            <ToggleRow label="Garden" value={garden} onToggle={() => setGarden((v) => !v)} />
            <ToggleRow label="Balcony" value={balcony} onToggle={() => setBalcony((v) => !v)} />
            <ToggleRow label="Elevator" value={lift} onToggle={() => setLift((v) => !v)} />
            <View className="mt-2">
              <NumberInput label="Garage Spots" value={garageSpots} onChange={setGarageSpots} />
              <NumberInput label="Parking Spots" value={parkingSpots} onChange={setParkingSpots} />
            </View>
            <SelectRow label="Heating System" options={HEATING_OPTIONS} value={heating} onChange={setHeating} />
            <SelectRow label="Air Conditioning" options={AC_OPTIONS} value={ac} onChange={setAc} />
            <SelectRow label="Kitchen Type" options={KITCHEN_OPTIONS} value={kitchenType} onChange={setKitchenType} />

            {/* Energy Rating */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Energy Rating</Text>
            <View className="flex-row gap-2 mb-4">
              {ENERGY_RATINGS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setEnergyRating(energyRating === r ? '' : r)}
                  className={`w-10 h-10 rounded-full border items-center justify-center ${
                    energyRating === r
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-300'
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: energyRating === r }}
                >
                  <Text className={`font-bold ${energyRating === r ? 'text-white' : 'text-gray-700'}`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'description' && (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Description ({description.length}/5000)
            </Text>
            <TextInput
              value={description}
              onChangeText={(v) => v.length <= 5000 && setDescription(v)}
              placeholder="Describe the property..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={10}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
              style={{ minHeight: 160, textAlignVertical: 'top' }}
              accessibilityLabel="Description"
            />
          </>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleNext} size="lg">
          Next: Photos
        </Button>
      </View>
    </View>
  );
}
