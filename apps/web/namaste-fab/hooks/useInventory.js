'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, userApi } from '@ecom/api-client';

/**
 * Custom hooks for inventory and location management
 */

// Locations
export function useLocations(options = {}) {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => inventoryApi.getLocations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useLocation(locationId, options = {}) {
  return useQuery({
    queryKey: ['location', locationId],
    queryFn: () => inventoryApi.getLocation(locationId),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => inventoryApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ locationId, data }) => inventoryApi.updateLocation(locationId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.locationId] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (locationId) => inventoryApi.deleteLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

// Stock/Inventory
export function useStock(params, options = {}) {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: () => inventoryApi.getStock(params),
    enabled: !!params?.sku && !!params?.locationId,
    staleTime: 2 * 60 * 1000, // 2 minutes (stock changes frequently)
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => inventoryApi.adjustStock(data),
    onSuccess: (data, variables) => {
      // Invalidate stock queries for the affected SKU and location
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      if (variables.sku && variables.locationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['stock', { sku: variables.sku, locationId: variables.locationId }] 
        });
      }
    },
  });
}

export function useStockLocations(sku, options = {}) {
  return useQuery({
    queryKey: ['stock-locations', sku],
    queryFn: () => inventoryApi.getStockLocations(sku),
    enabled: !!sku,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// Sellers (users with SELLER role)
export function useSellers(options = {}) {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: () => userApi.getUsersByRole('SELLER'),
    staleTime: 10 * 60 * 1000, // 10 minutes (sellers don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

