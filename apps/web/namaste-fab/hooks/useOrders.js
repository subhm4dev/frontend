'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@ecom/api-client';

/**
 * Custom hook for order queries and mutations
 * 
 * Provides:
 * - Get orders list (with pagination and filtering)
 * - Get order detail
 * - Update order status (admin)
 * - Cancel order
 */
export function useOrders(params = {}, options = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options, // Allow overriding default options (e.g., enabled)
  });
}

export function useOrder(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }) => orderApi.updateOrderStatus(orderId, data),
    onSuccess: (data, variables) => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, data }) => orderApi.cancelOrder(orderId, data),
    onSuccess: (data, variables) => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

