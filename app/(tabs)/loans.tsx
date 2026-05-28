import { View, Text, StyleSheet } from 'react-native';
import { colors, fontWeight } from '@/constants/theme';

export default function LoansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Loans</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: fontWeight.semibold,
    color: '#1f2937',
  },
});
