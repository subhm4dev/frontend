'use client';

import { create } from 'zustand';

/**
 * Auth Modal Store
 * 
 * Manages unified authentication modal state (single modal with tab switching).
 */
export const useAuthModalStore = create((set) => ({
  isOpen: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

/**
 * Hook to use auth modal
 * 
 * Provides functions to open/close the unified authentication modal.
 * Modal defaults to Login tab, user can switch to Sign Up tab.
 */
export function useAuthModal() {
  const { isOpen, open, close } = useAuthModalStore();

  return {
    isOpen,
    openLogin: open, // Alias for backward compatibility
    openRegister: open, // Alias for backward compatibility
    openModal: open,
    closeModal: close,
  };
}