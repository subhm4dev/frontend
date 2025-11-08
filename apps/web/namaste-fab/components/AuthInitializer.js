'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@ecom/api-client';

/**
 * Auth Initializer Component
 * 
 * Checks authentication status on app load.
 * Reads cookies via API route and syncs with Zustand store.
 * Sets up API client user provider for tenantId access.
 */
export function AuthInitializer() {
  const { checkAuthStatus, user } = useAuthStore();

  useEffect(() => {
    // Set up API client user provider to get tenantId
    // This allows catalog API to automatically include tenantId in requests
    apiClient.setUserProvider(() => useAuthStore.getState().user);
    
    // Set up API client token provider to get access token from cookies
    // The API client will fetch token from /api/auth/token if provider returns null
    apiClient.setTokenProvider(() => {
      // Tokens are in httpOnly cookies, so we can't read them directly
      // Return null to trigger fallback to /api/auth/token route
      return null;
    });
    
    // Check auth status when app loads
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Update user provider when user changes
  useEffect(() => {
    apiClient.setUserProvider(() => useAuthStore.getState().user);
  }, [user]);

  // This component doesn't render anything
  return null;
}