'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@ecom/api-client';

/**
 * Custom hook for profile operations
 */
export function useProfile(userId = 'me') {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getProfile(userId),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateOrUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => profileApi.createOrUpdateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

