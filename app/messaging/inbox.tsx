import { View, StyleSheet } from 'react-native';
import { AuthGate } from '@/components/auth/AuthGate';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { InboxList } from '@/components/messaging/InboxList';
import { useInbox } from '@/hooks/useMessages';
import { colors } from '@/constants/theme';

function InboxContent() {
  const { data, isLoading, isRefetching, refetch } = useInbox();

  const messages = data?.items ?? [];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Messages" back />

      <InboxList
        messages={messages}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}

export default function InboxScreen() {
  return (
    <AuthGate>
      <InboxContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
