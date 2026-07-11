import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useMyListings } from '@/hooks/useMyListings';
import { useDeleteProperty } from '@/hooks/useDeleteProperty';
import { useListingQuota } from '@/hooks/useUser';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { PublishStatusBadge } from '@/components/property/PublishStatusBadge';
import { CurrencyText } from '@/components/ui/CurrencyText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, fontSize, shadows } from '@/constants/theme';
import type { PropertySchema, PublishStatus } from '@/lib/types/property';

function QuotaExhaustedModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Quota Exhausted</Text>
          <Text style={styles.modalBody}>
            You have no remaining listing slots. Purchase a pack to create more listings.
          </Text>
          <Button
            onPress={() => {
              onClose();
              router.push('/listings/packs');
            }}
            size="lg"
          >
            Purchase a Pack
          </Button>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function RejectionModal({
  visible,
  reason,
  onClose,
}: {
  visible: boolean;
  reason: string | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetCard}>
          <Text style={styles.sheetTitle}>Rejection Reason</Text>
          <Text style={styles.sheetBody}>{reason ?? 'No reason provided.'}</Text>
          <Button onPress={onClose} variant="secondary">
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
}

function ListingCard({
  item,
  currency,
  onEdit,
  onDelete,
  onBoost,
  onViewRejection,
}: {
  item: PropertySchema;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onBoost: () => void;
  onViewRejection: () => void;
}) {
  const coverImage = item.image_urls?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/property/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {/* Cover image */}
      <View style={styles.cardImage}>
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.cardImageFill}
            resizeMode="cover"
            accessibilityLabel="Property photo"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Icon name="home" size={40} color={colors.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        {/* Status badge row */}
        <View style={styles.cardBadgeRow}>
          {item.publish_status ? (
            <TouchableOpacity
              onPress={item.publish_status === 'rejected' ? onViewRejection : undefined}
              disabled={item.publish_status !== 'rejected'}
              accessibilityRole={item.publish_status === 'rejected' ? 'button' : 'none'}
            >
              <PublishStatusBadge status={item.publish_status as PublishStatus} />
            </TouchableOpacity>
          ) : null}
          {item.is_boosted && (
            <View style={styles.boostedBadge}>
              <Text style={styles.boostedBadgeText}>Boosted</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <CurrencyText
          amount={item.price}
          currency={currency}
          style={styles.cardPrice}
        />

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnNeutral}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit listing"
          >
            <Text style={styles.actionBtnNeutralText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnDanger}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete listing"
          >
            <Text style={styles.actionBtnDangerText}>Delete</Text>
          </TouchableOpacity>
          {item.publish_status === 'published' && (
            <TouchableOpacity
              style={styles.actionBtnBrand}
              onPress={onBoost}
              accessibilityRole="button"
              accessibilityLabel="Boost listing"
            >
              <Text style={styles.actionBtnBrandText}>Boost</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyListingsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { data, isLoading, isRefetching, isError, refetch } = useMyListings();
  const { data: quota } = useListingQuota();
  const deleteProperty = useDeleteProperty();

  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{
    visible: boolean;
    reason: string | null;
  }>({ visible: false, reason: null });

  // Simple currency mapping
  const currency = countryCode === 'TN' ? 'TND' : countryCode === 'MA' ? 'MAD' : 'USD';

  if (!accessToken) {
    return (
      <View style={styles.gateContainer}>
        <Text style={styles.gateTitle}>Sign in required</Text>
        <Button onPress={() => router.push('/(auth)/welcome')} size="lg">
          Sign In
        </Button>
      </View>
    );
  }

  function handleCreate() {
    const totalRemaining = (quota?.free_remaining ?? 0) + (quota?.paid_remaining ?? 0);
    if (totalRemaining <= 0) {
      setShowQuotaModal(true);
      return;
    }
    router.push('/listings/create/step-1');
  }

  function handleDelete(id: number, title: string) {
    void haptic.warning();
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProperty.mutate(id),
        },
      ]
    );
  }

  function renderItem({ item }: ListRenderItemInfo<PropertySchema>) {
    return (
      <ListingCard
        item={item}
        currency={currency}
        onEdit={() => router.push(`/property/${item.id}/edit`)}
        onDelete={() => handleDelete(item.id, item.title)}
        onBoost={() => router.push(`/property/${item.id}/boost`)}
        onViewRejection={() =>
          setRejectionModal({ visible: true, reason: item.rejection_reason })
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Listings" back />
      {/* Quota subtitle + New button row */}
      <View style={styles.pageSubHeader}>
        {quota && (
          <Text style={styles.quotaSubtitle}>
            {quota.free_remaining} free + {quota.paid_remaining} paid slots remaining
          </Text>
        )}
        <TouchableOpacity
          onPress={handleCreate}
          style={styles.newBtn}
          accessibilityRole="button"
          accessibilityLabel="Create new listing"
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.centeredFillPadded}>
          <Text style={styles.errorMsg}>Failed to load your listings.</Text>
          <Button onPress={() => refetch()} variant="secondary">
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList<PropertySchema>
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => void refetch()}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="home" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first listing to start selling or renting.
              </Text>
              <Button onPress={handleCreate} size="lg">
                Create Listing
              </Button>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <QuotaExhaustedModal
        visible={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />

      <RejectionModal
        visible={rejectionModal.visible}
        reason={rejectionModal.reason}
        onClose={() => setRejectionModal({ visible: false, reason: null })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gateContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gateTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pageSubHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quotaSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    flex: 1,
  },
  newBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newBtnText: {
    color: colors.textOnBrand,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredFillPadded: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorMsg: {
    color: colors.textTertiary,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: fontSize.base,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtitle: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: fontSize.base,
  },
  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl2,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImage: {
    height: 144,
    backgroundColor: colors.border,
  },
  cardImageFill: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  boostedBadge: {
    backgroundColor: '#FEF9C3',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  boostedBadgeText: {
    fontSize: fontSize.xs,
    color: '#A16207',
    fontWeight: fontWeight.semibold,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtnNeutral: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionBtnNeutralText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  actionBtnDanger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionBtnDangerText: {
    fontSize: fontSize.xs,
    color: colors.error,
    fontWeight: fontWeight.medium,
  },
  actionBtnBrand: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionBtnBrandText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    color: colors.textTertiary,
    fontSize: fontSize.base,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl2,
    borderTopRightRadius: radius.xl2,
    padding: 24,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sheetBody: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: 20,
  },
});
