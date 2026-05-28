import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';

export function PropertyCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.imgPlaceholder} />
      <View style={styles.body}>
        <View style={[styles.line, { width: '40%', height: 22 }]} />
        <View style={styles.row}>
          <View style={[styles.line, { width: 64, height: 14 }]} />
          <View style={[styles.line, { width: 64, height: 14 }]} />
          <View style={[styles.line, { width: 80, height: 14 }]} />
        </View>
        <View style={[styles.line, { width: '75%', height: 14 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imgPlaceholder: { height: 210, backgroundColor: colors.neutral100 },
  body: { padding: 14, gap: 10 },
  row: { flexDirection: 'row', gap: 12 },
  line: { backgroundColor: colors.neutral200, borderRadius: radius.xs },
});
