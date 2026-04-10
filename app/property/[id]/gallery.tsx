import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  type ListRenderItemInfo,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property } = useProperty(id);
  const [activeIndex, setActiveIndex] = useState(0);

  const images: string[] = property?.image_urls ?? [];

  function renderItem({ item }: ListRenderItemInfo<string>) {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <Image
          source={{ uri: item }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          resizeMode="contain"
          accessibilityLabel="Property photo"
        />
      </View>
    );
  }

  if (!property || images.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">No photos available</Text>
        <TouchableOpacity
          className="mt-4 bg-white/20 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList<string>
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Close button */}
      <TouchableOpacity
        className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close gallery"
      >
        <Text className="text-white text-xl font-bold">×</Text>
      </TouchableOpacity>

      {/* Counter */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <View className="bg-black/50 rounded-full px-4 py-1.5">
          <Text className="text-white text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      </View>

      {/* Dot indicators */}
      {images.length > 1 && images.length <= 10 && (
        <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-1.5">
          {images.map((_, i) => (
            <View
              key={i}
              className={`rounded-full ${i === activeIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
