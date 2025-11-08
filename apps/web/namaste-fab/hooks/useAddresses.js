'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '@ecom/api-client';

/**
 * Custom hook for address CRUD operations
 * 
 * Provides:
 * - Get addresses list
 * - Get address detail
 * - Create address
 * - Update address
 * - Delete address
 */
export function useAddresses(userId) {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => addressApi.getAddresses(userId),
    enabled: true, // Always fetch (userId is optional, defaults to current user)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAddress(addressId) {
  return useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressApi.getAddress(addressId),
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => addressApi.createAddress(data),
    onSuccess: () => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ addressId, data }) => addressApi.updateAddress(addressId, data),
    onSuccess: (data, variables) => {
      // Invalidate addresses list and specific address
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['address', variables.addressId] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressId) => addressApi.deleteAddress(addressId),
    onSuccess: () => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

