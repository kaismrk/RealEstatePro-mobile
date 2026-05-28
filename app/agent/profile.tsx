import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgentProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

export default function AgentProfileScreen() {
  const { data: agent, isLoading, isError } = useAgentProfile();
  const updateAgent = useUpdateAgentProfile();

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!agent) return;
    setBio(agent.bio ?? '');
    setPhone(agent.phone ?? '');
  }, [agent]);

  function handleSave() {
    updateAgent.mutate(
      {
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Agent profile updated.');
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to update profile.');
        },
      }
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !agent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No agent profile found</Text>
        <Text style={styles.errorBody}>
          You need to register as an agent first.
        </Text>
        <Button onPress={() => router.replace('/agent/register')} size="lg">
          Register as Agent
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Profile</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verified badge */}
        <View style={styles.verifiedRow}>
          <View style={[styles.verifiedBadge, agent.verified ? styles.verifiedBadgeActive : styles.verifiedBadgeInactive]}>
            <Text style={[styles.verifiedBadgeText, agent.verified ? styles.verifiedBadgeTextActive : styles.verifiedBadgeTextInactive]}>
              {agent.verified ? 'Verified Agent' : 'Not yet verified'}
            </Text>
          </View>
          {agent.verified && (
            <Icon name="check" size={18} color={colors.success} style={{ marginLeft: 8 }} />
          )}
        </View>

        {agent.agency && (
          <View style={styles.agencyCard}>
            <Text style={styles.agencyLabel}>Agency</Text>
            <Text style={styles.agencyName}>{agent.agency.name}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>Bio</Text>
        <View style={styles.bioWrapper}>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell buyers and renters about yourself..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+216 XX XXX XXX"
          keyboardType="phone-pad"
        />

        <Text style={styles.footNote}>
          Verified status is set by the admin team and cannot be changed here.
        </Text>

        <View style={styles.scrollPadBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleSave} loading={updateAgent.isPending} size="lg">
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifiedBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  verifiedBadgeActive: {
    backgroundColor: colors.successBg,
  },
  verifiedBadgeInactive: {
    backgroundColor: colors.surfaceSunken,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  verifiedBadgeTextActive: {
    color: colors.success,
  },
  verifiedBadgeTextInactive: {
    color: colors.textSecondary,
  },
  agencyCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  agencyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  agencyName: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bioWrapper: {
    marginBottom: 16,
  },
  footNote: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    marginBottom: 24,
  },
  scrollPadBottom: {
    height: 96,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
