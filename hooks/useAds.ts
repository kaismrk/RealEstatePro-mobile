import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useSearchStore } from '@/lib/stores/search.store';
import { DEFAULT_AD_SETTINGS, type AdServeResponse } from '@/lib/types/ad';

const EMPTY_RESPONSE: AdServeResponse = { settings: DEFAULT_AD_SETTINGS, ads: [] };

/**
 * Fetches the sponsored ads batch for the search feed.
 *
 * Independent of the property list query — it never blocks or fails the feed:
 * any error resolves to `{ settings: defaults, ads: [] }` so `interleave()`
 * simply returns the properties untouched.
 *
 * Targeting params mirror the current search filters:
 *   - property_type    ← filters.property_type
 *   - transaction_type ← filters.listing_type (sale | rent)
 *   - governorate      — not sent yet: mobile filters have no governorate
 *     field (region_id is numeric); backend serves NULL-target ads regardless.
 */
export function useAds() {
  const propertyType = useSearchStore((s) => s.filters.property_type);
  const listingType = useSearchStore((s) => s.filters.listing_type);

  return useQuery<AdServeResponse>({
    queryKey: ['ads', { property_type: propertyType ?? null, transaction_type: listingType ?? null }],
    queryFn: async (): Promise<AdServeResponse> => {
      const params: Record<string, string | number> = {
        placement: 'search_results',
        limit: 5,
      };
      if (propertyType != null && propertyType !== '') params['property_type'] = propertyType;
      if (listingType != null && listingType !== '') params['transaction_type'] = listingType;

      try {
        const { data } = await api.get<AdServeResponse>('/ads/serve', { params });
        return {
          settings: data?.settings ?? DEFAULT_AD_SETTINGS,
          ads: Array.isArray(data?.ads) ? data.ads : [],
        };
      } catch {
        // Ads are best-effort: swallow every error and render a clean feed.
        return EMPTY_RESPONSE;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
