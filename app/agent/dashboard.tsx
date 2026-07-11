import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAgentDashboard, type PropertyWithStats } from '@/hooks/useAgentDashboard';
import { useAgentLeads } from '@/hooks/useAgentLeads';
import { PublishStatusBadge } from '@/components/property/PublishStatusBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';
import type { PublishStatus } from '@/lib/types/property';
import type { MessageResponse } from '@/lib/types/message';

function ListingStatCard({ item }: { item: PropertyWithStats }) {
  const { t } = useTranslation();
  const cover = item.image_urls?.[0];

  return (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => router.push(`/property/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.listingImageContainer}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.listingImage}
            resizeMode="cover"
            accessibilityLabel={t('myListings.photoAlt')}
          />
        ) : (
          <View style={styles.listingImagePlaceholder}>
            <Icon name="home" size={32} color={colors.textTertiary} />
          </View>
        )}
      </View>
      <View style={styles.listingCardBody}>
        {item.publish_status && (
          <View style={styles.listingBadgeWrapper}>
            <PublishStatusBadge status={item.publish_status as PublishStatus} />
          </View>
        )}
        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.listingStats}>
          <Text style={styles.listingStatText}>{t('agent.dashboard.inquiriesCount', { count: item.inquiry_count })}</Text>
          <Text style={styles.listingStatText}>{t('agent.dashboard.savesCount', { count: item.favorite_count })}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LeadRow({ item }: { item: MessageResponse }) {
  return (
    <TouchableOpacity
      style={styles.leadRow}
      onPress={() => router.push(`/messaging/${item.id}`)}
      accessibilityRole="button"
    >
      <View style={styles.leadRowBody}>
        <Text style={styles.leadSender} numberOfLines={1}>
          {item.sender_name ?? item.sender_email ?? `Sender #${item.sender_id}`}
        </Text>
        {item.property && (
          <Text style={styles.leadProperty} numberOfLines={1}>
            Re: {item.property.title}
          </Text>
        )}
        <Text style={styles.leadMessage} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function AgentDashboardScreen() {
  const { t } = useTranslation();
  const {
    data: dashboard,
    isLoading: dashLoading,
    isRefetching: dashRefetching,
    isError: dashError,
    refetch: refetchDashboard,
  } = useAgentDashboard();
  const {
    data: leads,
    isLoading: leadsLoading,
    isRefetching: leadsRefetching,
    refetch: refetchLeads,
  } = useAgentLeads();

  if (dashLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (dashError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No agent profile</Text>
        <Text style={styles.errorBody}>
          You need to register as an agent to access the dashboard.
        </Text>
        <Button onPress={() => router.push('/agent/register')} size="lg">
          {t('agent.dashboard.registerAsAgent')}
        </Button>
      </View>
    );
  }

  const totalInquiries = dashboard?.items.reduce((sum, p) => sum + p.inquiry_count, 0) ?? 0;
  const totalFavorites = dashboard?.items.reduce((sum, p) => sum + p.favorite_count, 0) ?? 0;
  const totalViews = dashboard?.items.reduce((sum, p) => sum + (p.view_count ?? 0), 0) ?? 0;
  const recentLeads = leads?.items.slice(0, 5) ?? [];

  const isRefreshing = (dashRefetching || leadsRefetching) && !dashLoading && !leadsLoading;

  function handleRefresh() {
    void refetchDashboard();
    void refetchLeads();
  }

  const stats = [
    { label: t('agent.dashboard.stats.listings'), value: dashboard?.total ?? 0 },
    { label: t('agent.dashboard.stats.inquiries'), value: totalInquiries },
    { label: t('agent.dashboard.stats.saves'), value: totalFavorites },
    { label: t('agent.dashboard.stats.views'), value: totalViews },
  ];

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agent.dashboard.title')}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Listings horizontal scroll */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('agent.dashboard.sections.myListings')}</Text>
          <TouchableOpacity onPress={() => router.push('/listings/my-listings')}>
            <Text style={styles.sectionLink}>{t('agent.dashboard.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {dashboard && dashboard.items.length > 0 ? (
          <FlatList<PropertyWithStats>
            data={dashboard.items.slice(0, 10)}
            renderItem={({ item }: ListRenderItemInfo<PropertyWithStats>) => (
              <ListingStatCard item={item} />
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        ) : (
          <View style={styles.emptyListings}>
            <Text style={styles.emptyListingsText}>{t('agent.dashboard.empty.listings')}</Text>
            <TouchableOpacity
              style={styles.emptyListingsLink}
              onPress={() => router.push('/listings/create/step-1')}
            >
              <Text style={styles.emptyListingsLinkText}>{t('agent.dashboard.empty.createFirst')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Leads */}
      <View style={styles.leadsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('agent.dashboard.sections.recentLeads')}</Text>
          <TouchableOpacity onPress={() => router.push('/agent/leads')}>
            <Text style={styles.sectionLink}>{t('agent.dashboard.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {leadsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : recentLeads.length > 0 ? (
          recentLeads.map((lead) => <LeadRow key={lead.id} item={lead} />)
        ) : (
          <View style={styles.emptyLeads}>
            <Text style={styles.emptyLeadsText}>{t('agent.dashboard.empty.leads')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginRight: 12,
    overflow: 'hidden',
    width: 208,
  },
  listingImageContainer: {
    height: 112,
    backgroundColor: colors.surfaceSunken,
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  listingImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingCardBody: {
    padding: 12,
  },
  listingBadgeWrapper: {
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  listingStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  listingStatText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyListings: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyListingsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyListingsLink: {
    marginTop: 12,
  },
  emptyListingsLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
  leadsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  leadRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leadRowBody: {
    flex: 1,
  },
  leadSender: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  leadProperty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leadMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyLeads: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyLeadsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
