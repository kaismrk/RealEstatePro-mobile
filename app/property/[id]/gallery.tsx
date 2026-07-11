import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property } = useProperty(id);
  const [activeIndex, setActiveIndex] = useState(0);

  const images: string[] = property?.image_urls ?? [];

  function renderItem({ item }: ListRenderItemInfo<string>) {
    return (
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item }}
          style={styles.fullImage}
          resizeMode="contain"
          accessibilityLabel="Property photo"
        />
      </View>
    );
  }

  if (!property || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos available</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        style={styles.closeBtn}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close gallery"
      >
        <Icon name="x" size={20} color={colors.surface} />
      </TouchableOpacity>

      {/* Counter */}
      <View style={styles.counterWrapper}>
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      </View>

      {/* Dot indicators */}
      {images.length > 1 && images.length <= 10 && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.neutral900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.surface,
    fontSize: fontSize.lg,
  },
  goBackBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackBtnText: {
    color: colors.surface,
    fontWeight: fontWeight.semibold,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterWrapper: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  counterText: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: radius.pill,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: colors.surface,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
