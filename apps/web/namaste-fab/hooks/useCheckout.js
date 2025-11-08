'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '@ecom/api-client';

/**
 * Custom hook for checkout operations
 */
export function useCheckoutInitiate() {
  return useMutation({
    mutationFn: (data) => checkoutApi.initiateCheckout(data),
  });
}

export function useCheckoutComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => checkoutApi.completeCheckout(data),
    onSuccess: () => {
      // Invalidate cart and orders after successful checkout
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

