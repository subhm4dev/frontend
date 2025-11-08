'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@ecom/api-client';

/**
 * Custom hook for payment operations
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentApi.getPaymentMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data) => paymentApi.createOrder(data),
  });
}

export function useProcessPayment() {
  return useMutation({
    mutationFn: (data) => paymentApi.processPayment(data),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => paymentApi.refundPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

