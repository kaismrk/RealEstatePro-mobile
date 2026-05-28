// Allows className prop on React Native components during the NativeWind → StyleSheet migration.
// className is ignored at runtime; components styled with StyleSheet.create() take precedence.
import 'react-native';

declare module 'react-native' {
  interface ViewProps    { className?: string }
  interface TextProps    { className?: string }
  interface ImageProps   { className?: string }
  interface ScrollViewProps { className?: string }
  interface TextInputProps  { className?: string }
  interface TouchableOpacityProps { className?: string }
  interface FlatListProps<ItemT> { className?: string }
  interface SafeAreaViewProps { className?: string }
  interface KeyboardAvoidingViewProps { className?: string }
  interface AnimatedComponentProps { className?: string }
}
