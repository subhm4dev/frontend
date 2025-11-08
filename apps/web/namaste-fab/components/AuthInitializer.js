'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Auth Initializer Component
 * 
 * Checks authentication status on app load.
 * Reads cookies via API route and syncs with Zustand store.
 */
export function AuthInitializer() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Check auth status when app loads
    checkAuthStatus();
  }, [checkAuthStatus]);

  // This component doesn't render anything
  return null;
}