import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

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
          backgroundColor: '#FFFFFF',
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
          <ActivityIndicator size="small" color="#2563EB" testID="search-loading" />
        ) : (
          <Text style={{ fontSize: 16 }}>{'🔍'}</Text>
        )}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#111827',
          }}
        >
          Search this area
        </Text>
      </TouchableOpacity>
    </View>
  );
}
