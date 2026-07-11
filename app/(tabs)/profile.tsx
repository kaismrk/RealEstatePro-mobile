import { View, Text, ScrollView, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useUser';
import { useInbox } from '@/hooks/useMessages';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useAgencies } from '@/hooks/useAgencies';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MenuRow } from '@/components/profile/MenuRow';
import { MenuSection } from '@/components/profile/MenuSection';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors, fontWeight } from '@/constants/theme';

function GuestView() {
  return (
    <SafeAreaView style={styles.safe}>
      <EmptyState
        title="Your Profile"
        subtitle="Sign in to access your profile, listings, and settings."
        icon={<User size={48} color={colors.textTertiary} />}
        action={{ label: 'Sign In', onPress: () => router.push('/(auth)/login') }}
      />
    </SafeAreaView>
  );
}

function AuthenticatedProfile() {
  const { data: user }       = useCurrentUser();
  const { data: inboxData }  = useInbox();
  const { data: agentProfile } = useAgentProfile();
  const { data: agencyList } = useAgencies();
  const logout = useLogout();
  const isAgent = !!agentProfile;
  const ownedAgency = agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;
  const unreadCount = inboxData?.items.filter((m) => !m.is_read).length ?? 0;

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {user ? <ProfileHeader user={user} /> : null}

        <MenuSection title="Account">
          <MenuRow icon="edit"         label="Edit Profile"      onPress={() => router.push('/profile/edit')} />
          <MenuRow icon="key"          label="Change Password"   onPress={() => router.push('/profile/change-password')} />
          <MenuRow icon="home"         label="My Listings"       onPress={() => router.push('/listings/my-listings')} />
          <MenuRow icon="chart"        label="Listing Quota"     onPress={() => router.push('/profile/quota')} />
          <MenuRow icon="gift"         label="Listing Packs"     onPress={() => router.push('/listings/packs')} />
          {isAgent ? (
            <MenuRow icon="trending-up" label="Agent Dashboard" onPress={() => router.push('/agent/dashboard')} />
          ) : (
            <MenuRow icon="building"    label="Become an Agent" onPress={() => router.push('/agent/register')} />
          )}
          {ownedAgency ? (
            <>
              <MenuRow icon="agency"      label="My Agency"            onPress={() => router.push('/agency/manage')} />
              <MenuRow icon="credit-card" label="Agency Subscription"  onPress={() => router.push('/agency/subscription')} />
            </>
          ) : (
            <MenuRow icon="agency"      label="Create Agency" onPress={() => router.push('/agency/create')} />
          )}
        </MenuSection>

        <MenuSection title="Activity">
          <MenuRow icon="chat"  label="Messages"     badge={unreadCount} onPress={() => router.push('/messaging/inbox')} />
          <MenuRow icon="heart" label="Saved Homes"  onPress={() => router.push('/(tabs)/saved')} />
          <MenuRow icon="bell"  label="Saved Searches" onPress={() => router.push('/(tabs)/updates')} />
        </MenuSection>

        <MenuSection title="Settings">
          <MenuRow icon="bell"     label="Notifications" onPress={() => router.push('/profile/notifications')} />
          <MenuRow icon="settings" label="App Settings"  onPress={() => router.push('/profile/settings')} />
          <MenuRow icon="help"     label="Help & Feedback" onPress={() => {}} />
          <MenuRow icon="privacy"  label="Privacy"        onPress={() => router.push('/profile/legal/privacy')} />
        </MenuSection>

        <MenuSection title="Account Actions">
          <MenuRow icon="logout" label="Sign Out" onPress={handleSignOut} destructive />
        </MenuSection>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <AuthenticatedProfile /> : <GuestView />;
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.textPrimary },
  spacer: { height: 32 },
});
