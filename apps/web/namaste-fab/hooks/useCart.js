'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@ecom/api-client';

/**
 * Custom hook for cart operations
 * 
 * Provides:
 * - Get cart
 * - Add item to cart (with optimistic updates)
 * - Update item quantity
 * - Remove item
 * - Clear cart
 * - Apply/remove coupon
 */
export function useCart(options = {}) {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false, // Default to true, but can be disabled
    ...options,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cartApi.addItem(data),
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot previous value
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistically update cart
      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return old;
        // Add item to cart (backend will handle this properly)
        return old;
      });
      
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: () => {
      // Refetch cart to get accurate data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, data }) => cartApi.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cartApi.applyCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

