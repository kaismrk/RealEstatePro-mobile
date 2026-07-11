import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@/lib/theme';

interface ClusterPinProps {
  count: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress?: () => void;
}

export function ClusterPin({ count, coordinate, onPress }: ClusterPinProps) {
  const { palette } = useTheme();
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={false}
      testID="cluster-pin"
    >
      <View
        testID="cluster-pin-container"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: palette.info,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: palette.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <Text
          testID="cluster-count"
          style={{
            color: palette.textOnBrand,
            fontSize: 13,
            fontWeight: '700',
          }}
        >
          {count}
        </Text>
      </View>
    </Marker>
  );
}
