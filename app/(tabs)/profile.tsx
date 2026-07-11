import { View, Text, ScrollView, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useUser';
import { useInbox } from '@/hooks/useMessages';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useAgencies } from '@/hooks/useAgencies';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MenuRow } from '@/components/profile/MenuRow';
import { MenuSection } from '@/components/profile/MenuSection';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors, fontWeight } from '@/constants/theme';

function GuestView() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe}>
      <EmptyState
        title={t('profile.guest.title')}
        subtitle={t('profile.guest.subtitle')}
        icon={<User size={48} color={colors.textTertiary} />}
        action={{ label: t('common.signIn'), onPress: () => router.push('/(auth)/login') }}
      />
    </SafeAreaView>
  );
}

function AuthenticatedProfile() {
  const { t } = useTranslation();
  const { data: user }       = useCurrentUser();
  const { data: inboxData }  = useInbox();
  const { data: agentProfile } = useAgentProfile();
  const { data: agencyList } = useAgencies();
  const logout = useLogout();
  const isAgent = !!agentProfile;
  const ownedAgency = agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;
  const unreadCount = inboxData?.items.filter((m) => !m.is_read).length ?? 0;

  function handleSignOut() {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.signOut'), style: 'destructive', onPress: () => logout.mutate() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.header.title')}</Text>
        </View>

        {user ? <ProfileHeader user={user} /> : null}

        <MenuSection title={t('profile.sections.account')}>
          <MenuRow icon="edit"         label={t('profile.account.editProfile')}      onPress={() => router.push('/profile/edit')} />
          <MenuRow icon="key"          label={t('profile.account.changePassword')}   onPress={() => router.push('/profile/change-password')} />
          <MenuRow icon="home"         label={t('profile.account.myListings')}       onPress={() => router.push('/listings/my-listings')} />
          <MenuRow icon="chart"        label={t('profile.account.listingQuota')}     onPress={() => router.push('/profile/quota')} />
          <MenuRow icon="gift"         label={t('profile.account.listingPacks')}     onPress={() => router.push('/listings/packs')} />
          {isAgent ? (
            <MenuRow icon="trending-up" label={t('profile.account.agentDashboard')} onPress={() => router.push('/agent/dashboard')} />
          ) : (
            <MenuRow icon="building"    label={t('profile.account.becomeAgent')}    onPress={() => router.push('/agent/register')} />
          )}
          {ownedAgency ? (
            <>
              <MenuRow icon="agency"      label={t('profile.account.myAgency')}           onPress={() => router.push('/agency/manage')} />
              <MenuRow icon="credit-card" label={t('profile.account.agencySubscription')} onPress={() => router.push('/agency/subscription')} />
            </>
          ) : (
            <MenuRow icon="agency"      label={t('profile.account.createAgency')} onPress={() => router.push('/agency/create')} />
          )}
        </MenuSection>

        <MenuSection title={t('profile.sections.activity')}>
          <MenuRow icon="chat"  label={t('profile.activity.messages')}     badge={unreadCount} onPress={() => router.push('/messaging/inbox')} />
          <MenuRow icon="heart" label={t('profile.activity.savedHomes')}   onPress={() => router.push('/(tabs)/saved')} />
          <MenuRow icon="bell"  label={t('profile.activity.savedSearches')} onPress={() => router.push('/(tabs)/updates')} />
        </MenuSection>

        <MenuSection title={t('profile.sections.settings')}>
          <MenuRow icon="bell"     label={t('profile.settings.notifications')} onPress={() => router.push('/profile/notifications')} />
          <MenuRow icon="settings" label={t('profile.settings.appSettings')}   onPress={() => router.push('/profile/settings')} />
          <MenuRow icon="help"     label={t('profile.settings.helpFeedback')}  onPress={() => router.push('/profile/help')} />
          <MenuRow icon="privacy"  label={t('profile.settings.privacy')}       onPress={() => router.push('/profile/legal/privacy')} />
        </MenuSection>

        <MenuSection title={t('profile.sections.accountActions')}>
          <MenuRow icon="logout" label={t('profile.signOut')} onPress={handleSignOut} destructive />
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
