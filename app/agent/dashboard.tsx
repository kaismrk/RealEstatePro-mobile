import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useAgentDashboard, type PropertyWithStats } from '@/hooks/useAgentDashboard';
import { useAgentLeads } from '@/hooks/useAgentLeads';
import { PublishStatusBadge } from '@/components/property/PublishStatusBadge';
import { Button } from '@/components/ui/Button';
import type { PublishStatus } from '@/lib/types/property';
import type { MessageResponse } from '@/lib/types/message';

function ListingStatCard({ item }: { item: PropertyWithStats }) {
  const cover = item.image_urls?.[0];

  return (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-xl mr-3 overflow-hidden w-52"
      onPress={() => router.push(`/property/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View className="h-28 bg-gray-200">
        {cover ? (
          <Image source={{ uri: cover }} className="w-full h-full" resizeMode="cover" accessibilityLabel="Property photo" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-3xl">🏠</Text>
          </View>
        )}
      </View>
      <View className="p-3">
        {item.publish_status && (
          <View className="mb-1">
            <PublishStatusBadge status={item.publish_status as PublishStatus} />
          </View>
        )}
        <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row gap-3 mt-1">
          <Text className="text-xs text-gray-500">
            {item.inquiry_count} inquiries
          </Text>
          <Text className="text-xs text-gray-500">
            {item.favorite_count} saves
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LeadRow({ item }: { item: MessageResponse }) {
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-xl p-4 mb-2 flex-row items-start"
      onPress={() => router.push(`/messaging/${item.id}`)}
      accessibilityRole="button"
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {item.sender_name ?? item.sender_email ?? `Sender #${item.sender_id}`}
        </Text>
        {item.property && (
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            Re: {item.property.title}
          </Text>
        )}
        <Text className="text-sm text-gray-700 mt-1" numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      <Text className="text-gray-400 ml-2">›</Text>
    </TouchableOpacity>
  );
}

export default function AgentDashboardScreen() {
  const { data: dashboard, isLoading: dashLoading, isRefetching: dashRefetching, isError: dashError, refetch: refetchDashboard } = useAgentDashboard();
  const { data: leads, isLoading: leadsLoading, isRefetching: leadsRefetching, refetch: refetchLeads } = useAgentLeads();

  if (dashLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (dashError) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">No agent profile</Text>
        <Text className="text-gray-500 text-center mb-5">
          You need to register as an agent to access the dashboard.
        </Text>
        <Button onPress={() => router.push('/agent/register')} size="lg">
          Register as Agent
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

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Agent Dashboard</Text>
      </View>

      {/* Stats row */}
      <View className="flex-row px-4 pt-4 gap-3 mb-5">
        {[
          { label: 'Listings', value: dashboard?.total ?? 0 },
          { label: 'Inquiries', value: totalInquiries },
          { label: 'Saves', value: totalFavorites },
          { label: 'Views', value: totalViews },
        ].map((stat) => (
          <View key={stat.label} className="flex-1 bg-white rounded-xl p-3 items-center border border-gray-100">
            <Text className="text-xl font-bold text-primary-500">{stat.value}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Listings horizontal scroll */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <Text className="text-base font-bold text-gray-900">My Listings</Text>
          <TouchableOpacity onPress={() => router.push('/listings/my-listings')}>
            <Text className="text-primary-500 text-sm">View all</Text>
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
          <View className="mx-4 bg-white rounded-xl p-5 border border-gray-100 items-center">
            <Text className="text-gray-500 text-sm">No listings yet.</Text>
            <TouchableOpacity
              className="mt-3"
              onPress={() => router.push('/listings/create/step-1')}
            >
              <Text className="text-primary-500 text-sm font-medium">Create your first listing</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Leads */}
      <View className="px-4 mb-8">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-gray-900">Recent Leads</Text>
          <TouchableOpacity onPress={() => router.push('/agent/leads')}>
            <Text className="text-primary-500 text-sm">View all</Text>
          </TouchableOpacity>
        </View>
        {leadsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : recentLeads.length > 0 ? (
          recentLeads.map((lead) => <LeadRow key={lead.id} item={lead} />)
        ) : (
          <View className="bg-white rounded-xl p-5 border border-gray-100 items-center">
            <Text className="text-gray-500 text-sm">No leads yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
