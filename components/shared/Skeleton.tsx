import { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonRowProps {
  lines?: number;
}

export function SkeletonRow({ lines = 2 }: SkeletonRowProps) {
  return (
    <View className="gap-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-white rounded-2xl mx-4 mb-4 overflow-hidden border border-gray-100">
      {/* Image placeholder */}
      <Skeleton height={180} borderRadius={0} />
      <View className="p-4 gap-y-2.5">
        {/* Title */}
        <Skeleton height={18} width="70%" />
        {/* Price */}
        <Skeleton height={22} width="40%" />
        {/* Details row */}
        <View className="flex-row gap-x-3 pt-1">
          <Skeleton height={14} width={60} />
          <Skeleton height={14} width={60} />
          <Skeleton height={14} width={60} />
        </View>
      </View>
    </View>
  );
}
