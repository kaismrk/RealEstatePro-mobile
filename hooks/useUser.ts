import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserResponse, UserUpdateProfileInput, ListingQuotaResponse } from '@/lib/types/user';

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<UserResponse>({
    queryKey: ['user', 'me'],
    queryFn: () => api.get<UserResponse>('/users/me').then((r) => r.data),
    enabled: !!accessToken,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UserUpdateProfileInput>({
    mutationFn: (data) =>
      api.put<UserResponse>('/users/me/profile', data).then((r) => r.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      // Keep auth store user in sync
      useAuthStore.getState().setUser({
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        country_code: updatedUser.country_code,
        is_active: updatedUser.is_active,
      });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { password: string }>({
    mutationFn: (data) =>
      api.put<UserResponse>('/users/me', data).then((r) => r.data),
    onSuccess: async () => {
      await useAuthStore.getState().clearAuth();
      queryClient.clear();
      router.replace('/(auth)/welcome');
    },
  });
}

export function useListingQuota() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<ListingQuotaResponse>({
    queryKey: ['quota'],
    queryFn: () =>
      api.get<ListingQuotaResponse>('/users/me/quota').then((r) => r.data),
    enabled: !!accessToken,
  });
}
