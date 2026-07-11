import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/lib/theme';

interface SearchThisAreaButtonProps {
  visible: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function SearchThisAreaButton({
  visible,
  loading = false,
  onPress,
}: SearchThisAreaButtonProps) {
  const { palette } = useTheme();

  if (!visible) return null;

  return (
    <View
      testID="search-this-area-wrapper"
      style={{
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        zIndex: 10,
      }}
    >
      <TouchableOpacity
        testID="search-this-area-button"
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityLabel="Search this area"
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: palette.surface,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        {loading ? (
          // ActivityIndicator is a third-party-adjacent UI primitive — color left as static
          <ActivityIndicator size="small" color="#2563EB" testID="search-loading" />
        ) : (
          <Text style={{ fontSize: 16 }}>{'🔍'}</Text>
        )}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: palette.textPrimary,
          }}
        >
          Search this area
        </Text>
      </TouchableOpacity>
    </View>
  );
}
