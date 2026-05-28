import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { Button } from '@/components/ui/Button';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

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
    <View style={niStyles.wrap}>
      <Text style={niStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="–"
        placeholderTextColor={colors.textTertiary}
        keyboardType="numeric"
        style={niStyles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

const niStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});

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
      style={trStyles.row}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Text style={trStyles.label}>{label}</Text>
      <View style={[trStyles.track, value ? trStyles.trackOn : trStyles.trackOff]}>
        <View style={[trStyles.thumb, value ? trStyles.thumbOn : trStyles.thumbOff]} />
      </View>
    </TouchableOpacity>
  );
}

const trStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  track: {
    width: 48,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.primary },
  trackOff: { backgroundColor: colors.borderStrong },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  thumbOn: { transform: [{ translateX: 12 }] },
  thumbOff: { transform: [{ translateX: -12 }] },
});

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
    <View style={srStyles.wrap}>
      <Text style={srStyles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={srStyles.row}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                srStyles.chip,
                value === opt.value ? srStyles.chipActive : srStyles.chipInactive,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === opt.value }}
            >
              <Text
                style={[
                  srStyles.chipText,
                  value === opt.value ? srStyles.chipTextActive : srStyles.chipTextInactive,
                ]}
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

const srStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipInactive: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  chipText: { fontSize: fontSize.sm },
  chipTextActive: { color: colors.textOnBrand },
  chipTextInactive: { color: colors.textSecondary },
});

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Property Details</Text>
        <Text style={styles.stepSubtitle}>Step 3 of 5 — Specs &amp; Amenities</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['specs', 'amenities', 'description'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'specs' ? 'Specs' : tab === 'amenities' ? 'Amenities' : 'Description'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <View style={styles.amenityInputsWrap}>
              <NumberInput label="Garage Spots" value={garageSpots} onChange={setGarageSpots} />
              <NumberInput label="Parking Spots" value={parkingSpots} onChange={setParkingSpots} />
            </View>
            <SelectRow label="Heating System" options={HEATING_OPTIONS} value={heating} onChange={setHeating} />
            <SelectRow label="Air Conditioning" options={AC_OPTIONS} value={ac} onChange={setAc} />
            <SelectRow label="Kitchen Type" options={KITCHEN_OPTIONS} value={kitchenType} onChange={setKitchenType} />

            {/* Energy Rating */}
            <Text style={styles.energyLabel}>Energy Rating</Text>
            <View style={styles.energyRow}>
              {ENERGY_RATINGS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setEnergyRating(energyRating === r ? '' : r)}
                  style={[
                    styles.energyChip,
                    energyRating === r ? styles.energyChipActive : styles.energyChipInactive,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: energyRating === r }}
                >
                  <Text
                    style={[
                      styles.energyChipText,
                      energyRating === r ? styles.energyChipTextActive : styles.energyChipTextInactive,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'description' && (
          <>
            <Text style={styles.descLabel}>
              Description ({description.length}/5000)
            </Text>
            <TextInput
              value={description}
              onChangeText={(v) => v.length <= 5000 && setDescription(v)}
              placeholder="Describe the property..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={10}
              style={styles.descInput}
              accessibilityLabel="Description"
            />
          </>
        )}

        <View style={styles.scrollBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleNext} size="lg">
          Next: Photos
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackBtn: {
    marginBottom: 8,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  screenTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  amenityInputsWrap: {
    marginTop: 8,
  },
  energyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  energyChip: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  energyChipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  energyChipText: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  energyChipTextActive: {
    color: colors.textOnBrand,
  },
  energyChipTextInactive: {
    color: colors.textSecondary,
  },
  descLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descInput: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  scrollBottom: {
    height: 128,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
