'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * React Query Provider
 * 
 * Wraps the app with QueryClientProvider for server state management.
 * 
 * ## What is React Query?
 * React Query manages server state (data from APIs). It handles:
 * - Automatic caching (no duplicate API calls)
 * - Loading and error states
 * - Background refetching
 * - Optimistic updates
 * - Request deduplication
 * 
 * ## Why do we need this?
 * Without React Query, you'd manually manage:
 * - Loading states for every API call
 * - Error handling for every request
 * - Caching logic to avoid duplicate requests
 * - Refetching logic to keep data fresh
 * 
 * React Query does all of this automatically!
 * 
 * ## Real-world Example
 * ```javascript
 * // Without React Query (manual):
 * const [products, setProducts] = useState([]);
 * const [loading, setLoading] = useState(true);
 * useEffect(() => {
 *   fetch('/api/products').then(...); // Manual state management
 * }, []);
 * 
 * // With React Query (automatic):
 * const { data: products, isLoading } = useQuery({
 *   queryKey: ['products'],
 *   queryFn: () => apiClient.get('/api/products'),
 * });
 * // React Query handles caching, loading, errors automatically!
 * ```
 * 
 * ## Configuration Explained
 * 
 * ### staleTime: 60 * 1000 (1 minute)
 * - Data is considered "fresh" for 1 minute
 * - During this time, React Query uses cached data (no API call)
 * - After 1 minute, data becomes "stale" and refetches in background
 * - **Benefit**: Faster UX, fewer server requests
 * 
 * ### refetchOnWindowFocus: false
 * - Prevents automatic refetch when user switches browser tabs
 * - **Why**: Reduces unnecessary API calls when user just switches tabs
 * - **Trade-off**: Data might be slightly stale, but acceptable for most cases
 * 
 * ### retry: 1
 * - If an API call fails, retry once before showing error
 * - **Why**: Network hiccups are common, one retry often succeeds
 * - **Benefit**: Better UX (fewer false errors)
 * 
 * ### throwOnError: false
 * - Errors are handled gracefully (stored in error state)
 * - Components can check `error` and display user-friendly messages
 * - **Why**: Prevents unhandled promise rejections
 * 
 * ## Usage in Components
 * ```javascript
 * import { useQuery } from '@tanstack/react-query';
 * 
 * function ProductList() {
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: ['products'],
 *     queryFn: () => apiClient.get('/api/products'),
 *   });
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <ProductList items={data} />;
 * }
 * ```
 * 
 * @param {React.ReactNode} children - App components to wrap
 * @returns {JSX.Element} QueryClientProvider wrapper
 */
export function ReactQueryProvider({ children }) {
  // Create QueryClient once per app instance
  // Using useState with function initializer ensures it's only created once
  // This prevents recreating the client on every re-render (performance optimization)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            // During this time, React Query uses cached data (no API call)
            // After 1 minute, data becomes "stale" and refetches in background
            staleTime: 60 * 1000,

            // Don't refetch when user switches browser tabs back
            // Reduces unnecessary API calls
            // Set to true if you need real-time data updates
            refetchOnWindowFocus: false,

            // Retry failed requests once before showing error
            // Handles temporary network issues gracefully
            retry: 1,

            // Don't throw errors, store them in error state instead
            // Allows components to handle errors gracefully
            throwOnError: false,
          },
          mutations: {
            // Retry failed mutations (POST/PUT/DELETE) once
            // Useful for network hiccups during form submissions
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}