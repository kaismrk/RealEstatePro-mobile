import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function PropertyCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
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
      style={{ opacity }}
      className="bg-white rounded-2xl overflow-hidden mb-4 mx-4 border border-gray-100"
    >
      {/* Photo placeholder */}
      <View className="h-52 bg-gray-200" />

      {/* Body placeholder */}
      <View className="p-3 gap-2">
        {/* Price line */}
        <View className="h-6 bg-gray-200 rounded-md w-2/5" />
        {/* Details row */}
        <View className="flex-row gap-3">
          <View className="h-4 bg-gray-200 rounded-md w-16" />
          <View className="h-4 bg-gray-200 rounded-md w-16" />
          <View className="h-4 bg-gray-200 rounded-md w-20" />
        </View>
        {/* Address line */}
        <View className="h-4 bg-gray-200 rounded-md w-3/4" />
      </View>
    </Animated.View>
  );
}
