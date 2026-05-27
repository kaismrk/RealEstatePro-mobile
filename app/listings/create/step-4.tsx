import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUIStore } from '@/lib/stores/ui.store';
import { Button } from '@/components/ui/Button';

const MAX_IMAGES = 20;

export default function CreateStep4() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);

  const initialUris = Array.isArray(draft?.image_urls)
    ? (draft.image_urls as string[])
    : [];
  const [imageUris, setImageUris] = useState<string[]>(initialUris);

  async function handlePickImages() {
    if (imageUris.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can upload at most ${MAX_IMAGES} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission denied',
        'Media library access is required to pick photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - imageUris.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImageUris((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  }

  function handleRemove(uri: string) {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  }

  function handleNext() {
    setDraft({ image_urls: imageUris });
    router.push('/listings/create/step-5');
  }

  function renderItem({ item, index }: ListRenderItemInfo<string>) {
    return (
      <View className="mr-3 mb-3 relative">
        <Image
          source={{ uri: item }}
          className="w-24 h-24 rounded-xl bg-gray-100"
          resizeMode="cover"
          accessibilityLabel={`Photo ${index + 1}`}
        />
        <TouchableOpacity
          onPress={() => handleRemove(item)}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={`Remove photo ${index + 1}`}
        >
          <Text className="text-white text-xs font-bold">×</Text>
        </TouchableOpacity>
        {index === 0 && (
          <View className="absolute bottom-1 left-1 bg-primary-500 rounded px-1 py-0.5">
            <Text className="text-white text-xs">Cover</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-primary-500 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Photos</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Step 4 of 5 — Photos ({imageUris.length}/{MAX_IMAGES})
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Upload button */}
        <TouchableOpacity
          onPress={handlePickImages}
          className="border-2 border-dashed border-gray-300 rounded-2xl py-10 items-center justify-center mb-5"
          accessibilityRole="button"
          accessibilityLabel="Add photos"
        >
          <Text className="text-4xl mb-2">📷</Text>
          <Text className="text-base font-semibold text-gray-700">Add Photos</Text>
          <Text className="text-sm text-gray-400 mt-1">
            Up to {MAX_IMAGES} photos. Tap to select.
          </Text>
        </TouchableOpacity>

        {/* Photo grid */}
        {imageUris.length > 0 && (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Selected photos — first photo is the cover
            </Text>
            <FlatList<string>
              data={imageUris}
              renderItem={renderItem}
              keyExtractor={(uri, i) => `${uri}-${i}`}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 8 }}
            />
          </>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleNext} size="lg">
          Next: Review
        </Button>
      </View>
    </View>
  );
}
