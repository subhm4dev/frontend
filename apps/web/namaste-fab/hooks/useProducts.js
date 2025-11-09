'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@ecom/api-client';

/**
 * Custom hook for product queries and mutations
 * 
 * Provides:
 * - Product list with search, filtering, pagination
 * - Product detail
 * - Product mutations (create, update, delete) for admin
 */
export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => catalogApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    ...options, // Allow overriding default options (e.g., enabled)
  });
}

export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => catalogApi.getProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => catalogApi.createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, data }) => catalogApi.updateProduct(productId, data),
    onSuccess: (data, variables) => {
      // Invalidate products list and specific product
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => catalogApi.deleteProduct(productId),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => catalogApi.createCategory(data),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, data }) => catalogApi.updateCategory(categoryId, data),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId) => catalogApi.deleteCategory(categoryId),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

