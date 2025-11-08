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
      hasCheckedAuth: false, // Track if initial auth check has completed
      error: null,

      // Check auth status by calling API route
      // This reads cookies (which client components can't do directly)
      checkAuthStatus: async () => {
        set({ isLoading: true, hasCheckedAuth: false });
        try {
          const response = await fetch('/api/auth/status');
          const data = await response.json();
          
          if (data.isAuthenticated) {
            // User is authenticated (cookie exists)
            // Update user info with roles from API response
            set({
              isAuthenticated: true,
              user: {
                ...get().user,
                id: data.userId || get().user?.id,
                roles: data.roles || [],
                tenantId: data.tenantId || get().user?.tenantId,
              },
              isLoading: false,
              hasCheckedAuth: true,
              error: null,
            });
          } else {
            // User is not authenticated
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              hasCheckedAuth: true,
              error: null,
            });
          }
        } catch (error) {
          
          set({
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
            error: 'Failed to check auth status',
          });
        }
      },

      // Check if user has ADMIN role
      isAdmin: () => {
        const user = get().user;
        if (!user || !user.roles) return false;
        return Array.isArray(user.roles) 
          ? user.roles.includes('ADMIN')
          : user.roles === 'ADMIN';
      },

      // Login
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          
          // Backend sets cookies automatically (tokens in cookies)
          // Store user info in Zustand (will be persisted to localStorage)
          // Backend returns role as array or single value
          const roles = Array.isArray(response.role) 
            ? response.role 
            : response.role 
              ? [response.role] 
              : [];
          
          set({
            user: {
              id: response.id,
              roles: roles,
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
          // Backend returns role as array or single value
          const roles = Array.isArray(response.role) 
            ? response.role 
            : response.role 
              ? [response.role] 
              : [];
          
          set({
            user: {
              id: response.id,
              roles: roles,
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