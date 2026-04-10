import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useUser';
import { useInbox } from '@/hooks/useMessages';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MenuRow } from '@/components/profile/MenuRow';
import { MenuSection } from '@/components/profile/MenuSection';
import { Button } from '@/components/ui/Button';

function GuestView() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Text className="text-5xl mb-4">👤</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Your Profile</Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Sign in to access your profile, listings, and settings.
      </Text>
      <Button
        onPress={() => router.push('/(auth)/welcome')}
        size="lg"
        className="w-full"
      >
        Sign In
      </Button>
    </View>
  );
}

function AuthenticatedProfile() {
  const { data: user } = useCurrentUser();
  const { data: inboxData } = useInbox();
  const logout = useLogout();

  const unreadCount = inboxData?.items.filter((m) => !m.is_read).length ?? 0;

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout.mutate(),
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-2 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Profile</Text>
      </View>

      {/* User avatar card */}
      {user ? (
        <View className="bg-white">
          <ProfileHeader user={user} />
        </View>
      ) : null}

      {/* Account section */}
      <MenuSection title="Account">
        <MenuRow
          icon="✏️"
          label="Edit Profile"
          onPress={() => router.push('/profile/edit')}
        />
        <MenuRow
          icon="🔑"
          label="Change Password"
          onPress={() => router.push('/profile/change-password')}
        />
        <MenuRow
          icon="🏠"
          label="My Listings"
          onPress={() => router.push('/listings/my-listings')}
        />
        <MenuRow
          icon="📊"
          label="Listing Quota"
          onPress={() => router.push('/profile/quota')}
        />
      </MenuSection>

      {/* Activity section */}
      <MenuSection title="Activity">
        <MenuRow
          icon="💬"
          label="Messages"
          badge={unreadCount}
          onPress={() => router.push('/messaging/inbox')}
        />
        <MenuRow
          icon="❤️"
          label="Saved Homes"
          onPress={() => router.push('/(tabs)/saved')}
        />
        <MenuRow
          icon="🔔"
          label="Saved Searches"
          onPress={() => router.push('/(tabs)/updates')}
        />
      </MenuSection>

      {/* Settings section */}
      <MenuSection title="Settings">
        <MenuRow
          icon="🔔"
          label="Notifications"
          onPress={() => router.push('/profile/notifications')}
        />
        <MenuRow
          icon="⚙️"
          label="App Settings"
          onPress={() => router.push('/profile/settings')}
        />
        <MenuRow
          icon="❓"
          label="Help & Feedback"
          onPress={() => {}}
        />
        <MenuRow
          icon="🔒"
          label="Privacy"
          onPress={() => {}}
        />
      </MenuSection>

      {/* Danger zone */}
      <MenuSection title="Account Actions">
        <MenuRow
          icon="🚪"
          label="Sign Out"
          onPress={handleSignOut}
          destructive
        />
      </MenuSection>

      <View className="h-8" />
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <GuestView />;
  }

  return <AuthenticatedProfile />;
}
