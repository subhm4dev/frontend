'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, RegisterRequestSchema } from '@ecom/shared-schemas';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';

/**
 * Unified Auth Modal Component
 * 
 * Single modal with tab switching between Login and Sign Up.
 * Defaults to Login tab.
 * Smooth tab transitions with Framer Motion.
 */
export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(LoginRequestSchema),
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const handleLogin = async (data) => {
    try {
      clearError();
      await login(data);
      loginForm.reset();
      closeModal();
    } catch (error) {
      
    }
  };

  const handleRegister = async (data) => {
    try {
      clearError();
      await registerUser(data);
      registerForm.reset();
      closeModal();
    } catch (error) {
      
    }
  };

  const handleClose = () => {
    loginForm.reset();
    registerForm.reset();
    clearError();
    setActiveTab('login');
    setShowPassword(false);
    closeModal();
  };

  const switchToRegister = () => {
    loginForm.reset();
    clearError();
    setActiveTab('register');
  };

  const switchToLogin = () => {
    registerForm.reset();
    clearError();
    setActiveTab('login');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'login'
                  ? 'text-amber-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
              {activeTab === 'login' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-900"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'register'
                  ? 'text-amber-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-900"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  {/* Email or Phone */}
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Phone
                    </label>
                    <input
                      {...loginForm.register('email')}
                      type="text"
                      id="login-email"
                      placeholder="email@example.com or +919876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label htmlFor="login-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (if not using email)
                    </label>
                    <input
                      {...loginForm.register('phone')}
                      type="tel"
                      id="login-phone"
                      placeholder="+919876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                    />
                    {loginForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-amber-900 text-white py-2.5 px-4 rounded-md hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </motion.button>
                </form>

                {/* Switch to Register */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={switchToRegister}
                      className="text-amber-900 hover:text-amber-800 font-medium transition-colors"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  {/* Email or Phone */}
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Phone
                    </label>
                    <input
                      {...registerForm.register('email')}
                      type="text"
                      id="register-email"
                      placeholder="email@example.com or +919876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (if not using email)
                    </label>
                    <input
                      {...registerForm.register('phone')}
                      type="tel"
                      id="register-phone"
                      placeholder="+919876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                    />
                    {registerForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="register-role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      {...registerForm.register('role')}
                      id="register-role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SELLER">Seller</option>
                    </select>
                    {registerForm.formState.errors.role && (
                      <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.role.message}</p>
                    )}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-amber-900 text-white py-2.5 px-4 rounded-md hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                  >
                    {isLoading ? 'Registering...' : 'Sign Up'}
                  </motion.button>
                </form>

                {/* Switch to Login */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={switchToLogin}
                      className="text-amber-900 hover:text-amber-800 font-medium transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

