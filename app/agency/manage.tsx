/**
 * Agency management screen — owner can edit or delete their agency.
 *
 * BACKEND GAP: GET /agencies/ does not support an `owner_id` filter, so we fetch
 * all agencies and filter client-side by owner_id matching the current user's id.
 * When the backend adds owner_id filtering, update the queryFn in useAgencies.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAgencies, useUpdateAgency, useDeleteAgency } from '@/hooks/useAgencies';
import { useCurrentUser } from '@/hooks/useUser';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  required?: boolean;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.fieldRequired}> *</Text>}
      </Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function ManageAgencyScreen() {
  const { data: user } = useCurrentUser();
  const { data: agencyList, isLoading } = useAgencies();
  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  // Find agency owned by current user
  const ownedAgency =
    agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  // Populate fields when agency loads
  useEffect(() => {
    if (ownedAgency) {
      setName(ownedAgency.name);
      setLogoUrl(ownedAgency.logo_url ?? '');
      setDescription(ownedAgency.description ?? '');
      setWebsite(ownedAgency.social_links?.website ?? '');
      setFacebook(ownedAgency.social_links?.facebook ?? '');
      setInstagram(ownedAgency.social_links?.instagram ?? '');
      setTwitter(ownedAgency.social_links?.twitter ?? '');
    }
  }, [ownedAgency?.id]);

  function handleSave() {
    if (!ownedAgency) return;
    if (!name.trim()) {
      Alert.alert('Validation', 'Agency name is required.');
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (website.trim()) socialLinks.website = website.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (twitter.trim()) socialLinks.twitter = twitter.trim();

    updateAgency.mutate(
      {
        id: ownedAgency.id,
        data: {
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          description: description.trim() || null,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Saved', 'Agency profile updated successfully.');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Failed to save changes. Please try again.';
          Alert.alert('Error', msg);
        },
      }
    );
  }

  function handleDelete() {
    if (!ownedAgency) return;

    Alert.alert(
      'Delete Agency',
      `Are you sure you want to permanently delete "${ownedAgency.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAgency.mutate(ownedAgency.id, {
              onSuccess: () => {
                router.replace('/(tabs)/profile');
              },
              onError: (err: unknown) => {
                const msg =
                  (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Failed to delete agency.';
                Alert.alert('Error', msg);
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ownedAgency) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="home" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Agency Yet</Text>
        <Text style={styles.emptyBody}>
          You don't own an agency. Create one to start listing properties under your brand.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/agency/create')}
          accessibilityRole="button"
        >
          <Text style={styles.emptyBtnText}>Create Agency</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerBack}
        >
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Agency</Text>
        <TouchableOpacity
          onPress={() => router.push(`/agency/${ownedAgency.id}`)}
          accessibilityRole="button"
          accessibilityLabel="View public profile"
        >
          <Text style={styles.headerAction}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Field label="Agency Name" value={name} onChangeText={setName} required />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://example.com/logo.png"
          keyboardType="url"
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell potential clients about your agency…"
          multiline
        />

        <Text style={styles.sectionLabel}>Social Links</Text>
        <Field
          label="Website"
          value={website}
          onChangeText={setWebsite}
          placeholder="https://your-website.com"
          keyboardType="url"
        />
        <Field
          label="Facebook"
          value={facebook}
          onChangeText={setFacebook}
          placeholder="https://facebook.com/yourpage"
          keyboardType="url"
        />
        <Field
          label="Instagram"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="https://instagram.com/youraccount"
          keyboardType="url"
        />
        <Field
          label="Twitter / X"
          value={twitter}
          onChangeText={setTwitter}
          placeholder="https://x.com/youraccount"
          keyboardType="url"
        />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, updateAgency.isPending && styles.saveBtnPending]}
          onPress={handleSave}
          disabled={updateAgency.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save agency changes"
        >
          {updateAgency.isPending ? (
            <ActivityIndicator size="small" color={colors.textOnBrand} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Subscription shortcut */}
        <TouchableOpacity
          style={styles.outlineBtnPrimary}
          onPress={() => router.push('/agency/subscription')}
          accessibilityRole="button"
          accessibilityLabel="Manage subscription"
        >
          <Text style={styles.outlineBtnPrimaryText}>Manage Subscription</Text>
        </TouchableOpacity>

        {/* Agent roster shortcut */}
        <TouchableOpacity
          style={styles.outlineBtnNeutral}
          onPress={() => router.push('/agency/roster')}
          accessibilityRole="button"
          accessibilityLabel="View agent roster"
        >
          <Text style={styles.outlineBtnNeutralText}>Agent Roster</Text>
        </TouchableOpacity>

        {/* Danger zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerBody}>
            Deleting your agency is permanent and cannot be undone.
          </Text>
          <TouchableOpacity
            style={[styles.deleteBtn, deleteAgency.isPending && styles.deleteBtnPending]}
            onPress={handleDelete}
            disabled={deleteAgency.isPending}
            accessibilityRole="button"
            accessibilityLabel="Delete agency"
          >
            {deleteAgency.isPending ? (
              <ActivityIndicator size="small" color={colors.textOnBrand} />
            ) : (
              <Text style={styles.deleteBtnText}>Delete Agency</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.surface,
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
    flex: 1,
  },
  headerAction: {
    color: colors.primary,
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldRequired: {
    color: colors.error,
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnPending: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
  outlineBtnPrimary: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineBtnPrimaryText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
  outlineBtnNeutral: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  outlineBtnNeutralText: {
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
  dangerZone: {
    marginTop: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radius.md,
    padding: 16,
    backgroundColor: colors.errorBg,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    marginBottom: 8,
  },
  dangerBody: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 12,
  },
  deleteBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteBtnPending: {
    opacity: 0.6,
  },
  deleteBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
});
