'use client';

import { create } from 'zustand';

/**
 * Auth Modal Store
 * 
 * Manages which authentication modal is open (login or register).
 */
export const useAuthModalStore = create((set) => ({
  isLoginOpen: false,
  isRegisterOpen: false,

  openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
  openRegister: () => set({ isLoginOpen: false, isRegisterOpen: true }),
  closeModal: () => set({ isLoginOpen: false, isRegisterOpen: false }),
}));

/**
 * Hook to use auth modal
 * 
 * Provides functions to open/close login and register modals.
 */
export function useAuthModal() {
  const { isLoginOpen, isRegisterOpen, openLogin, openRegister, closeModal } = useAuthModalStore();

  return {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    openRegister,
    closeModal,
  };
}