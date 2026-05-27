import { View, Text } from 'react-native';
import type { UserResponse } from '@/lib/types/user';

interface ProfileHeaderProps {
  user: UserResponse;
}

function getInitials(user: UserResponse): string {
  const first = user.first_name?.trim()[0] ?? '';
  const last = user.last_name?.trim()[0] ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email[0]?.toUpperCase() ?? '?';
}

function getDisplayName(user: UserResponse): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return user.email;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <View className="flex-row items-center px-4 py-6 border-b border-gray-100">
      {/* Avatar */}
      <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mr-4">
        <Text className="text-white text-2xl font-bold">{initials}</Text>
      </View>

      {/* Name + email */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
          {displayName}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
          {user.email}
        </Text>
        {user.country_code ? (
          <Text className="text-xs text-gray-400 mt-0.5">{user.country_code}</Text>
        ) : null}
      </View>
    </View>
  );
}
