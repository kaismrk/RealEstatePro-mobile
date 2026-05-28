import { View, Text, StyleSheet } from 'react-native';
import type { UserResponse } from '@/lib/types/user';
import { colors, fontWeight } from '@/constants/theme';

function getInitials(user: UserResponse): string {
  const first = user.first_name?.trim()[0] ?? '';
  const last  = user.last_name?.trim()[0]  ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email[0]?.toUpperCase() ?? '?';
}

function getDisplayName(user: UserResponse): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.email;
}

interface ProfileHeaderProps { user: UserResponse }

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(user)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{getDisplayName(user)}</Text>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        {user.country_code ? (
          <Text style={styles.country}>{user.country_code}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar:  { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  initials: { fontSize: 22, fontWeight: fontWeight.bold, color: '#fff' },
  info:    { flex: 1 },
  name:    { fontSize: 17, fontWeight: fontWeight.bold, color: colors.textPrimary },
  email:   { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  country: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
});
