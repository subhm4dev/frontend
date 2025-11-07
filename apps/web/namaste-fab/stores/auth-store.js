'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient, { authApi } from '@ecom/api-client';

/**
 * Auth Store
 * 
 * Manages authentication state and integrates with API client.
 * Uses Zustand persist middleware to save tokens to localStorage.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize: Set up token provider for API client
      initialize: () => {
        apiClient.setTokenProvider(() => ({
          accessToken: get().accessToken,
          refreshToken: get().refreshToken,
        }));
      },

      // Login
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
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
          
          // Note: Backend returns "token" not "accessToken" for register
          set({
            accessToken: response.token,
            refreshToken: response.refreshToken,
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
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
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
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken(refreshToken);
          
          set({
            accessToken: response.accessToken,
            // Refresh token stays the same
          });

          return response;
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
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
        // Only persist tokens and user, not loading/error states
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize token provider when store is created
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}