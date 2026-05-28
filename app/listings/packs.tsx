import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useListingPacks, type ListingPackResponse } from '@/hooks/useListingPacks';
import { usePurchasePack } from '@/hooks/usePurchasePack';
import { useListingQuota } from '@/hooks/useUser';
import { Button } from '@/components/ui/Button';
import { colors, radius, fontWeight, fontSize, shadows } from '@/constants/theme';

export default function PacksScreen() {
  const { data, isLoading, isError, refetch } = useListingPacks();
  const { data: quota } = useListingQuota();
  const purchasePack = usePurchasePack();

  function handlePurchase(pack: ListingPackResponse) {
    Alert.alert(
      'Purchase Pack',
      `Buy "${pack.name}" for ${pack.price.toFixed(2)} TND and receive ${pack.listing_count} listing slot${pack.listing_count !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            purchasePack.mutate(pack.id, {
              onSuccess: (quota) => {
                Alert.alert(
                  'Success',
                  `${pack.listing_count} listing slot${pack.listing_count !== 1 ? 's' : ''} added to your quota! You now have ${quota.paid_remaining} paid slots.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              },
              onError: (err) => {
                Alert.alert('Error', err.message ?? 'Purchase failed. Please try again.');
              },
            });
          },
        },
      ]
    );
  }

  function renderItem({ item }: ListRenderItemInfo<ListingPackResponse>) {
    return (
      <View style={styles.packCard}>
        <View style={styles.packHeader}>
          <View style={styles.packInfo}>
            <Text style={styles.packName}>{item.name}</Text>
            <Text style={styles.packSlots}>
              {item.listing_count} listing slot{item.listing_count !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.packPrice}>{item.price.toFixed(2)} TND</Text>
        </View>
        <TouchableOpacity
          onPress={() => handlePurchase(item)}
          disabled={purchasePack.isPending}
          style={styles.purchaseBtn}
          accessibilityRole="button"
          accessibilityLabel={`Purchase ${item.name}`}
        >
          <Text style={styles.purchaseBtnText}>
            {purchasePack.isPending ? 'Processing...' : 'Purchase'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Listing Packs</Text>
      </View>

      {/* Current quota */}
      {quota && (
        <View style={styles.quotaBanner}>
          <Text style={styles.quotaBannerTitle}>Current Quota</Text>
          <Text style={styles.quotaBannerBody}>
            {quota.free_remaining} free slot{quota.free_remaining !== 1 ? 's' : ''} +{' '}
            {quota.paid_remaining} paid slot{quota.paid_remaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.centeredFillPadded}>
          <Text style={styles.errorMsg}>Failed to load listing packs.</Text>
          <Button onPress={() => refetch()} variant="secondary">
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList<ListingPackResponse>
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No packs available in your country
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.base,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  quotaBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: radius.md,
    padding: 12,
  },
  quotaBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  quotaBannerBody: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: 2,
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
    paddingTop: 48,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  packCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl2,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  packSlots: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  packPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginLeft: 12,
  },
  purchaseBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  purchaseBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
});
