'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient, { authApi } from '@ecom/api-client';

/**
 * Auth Store
 * 
 * Manages authentication UI state.
 * - User info stored in localStorage (for persistence across refreshes)
 * - Tokens stored in cookies (set by backend, more secure)
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Check auth status by calling API route
      // This reads cookies (which client components can't do directly)
      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/status');
          const data = await response.json();
          
          if (data.isAuthenticated) {
            // User is authenticated (cookie exists)
            // User info should already be in store from localStorage (if previously logged in)
            set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // User is not authenticated
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Auth status check error:', error);
          set({
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to check auth status',
          });
        }
      },

      // Login
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          
          // Backend sets cookies automatically (tokens in cookies)
          // Store user info in Zustand (will be persisted to localStorage)
          set({
            user: {
              id: response.id,
              roles: response.role,
              tenantId: response.tenantId,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          });
          throw error;
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          
          // Backend sets cookies automatically (tokens in cookies)
          // Store user info in Zustand (will be persisted to localStorage)
          set({
            user: {
              id: response.id,
              roles: response.role,
              tenantId: response.tenantId,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Registration failed',
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API (backend will clear cookies)
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        } finally {
          // Clear UI state (cookies cleared by backend)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Logout from all devices
      logoutAll: async () => {
        set({ isLoading: true });
        try {
          await authApi.logoutAll();
        } catch (error) {
          console.error('Logout all error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user info and auth status, NOT tokens
        // Tokens are in cookies (set by backend)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);