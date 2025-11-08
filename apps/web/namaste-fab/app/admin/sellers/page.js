'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema } from '@ecom/shared-schemas';
import { authApi } from '@ecom/api-client';

/**
 * Admin Sellers Management Page
 * 
 * Onboard new sellers and manage existing sellers.
 */
export default function AdminSellersPage() {
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      role: 'SELLER',
    },
  });

  const handleSubmit = async (data) => {
    setIsOnboarding(true);
    try {
      await authApi.register({
        ...data,
        role: 'SELLER',
      });
      alert('Seller onboarded successfully');
      reset();
      setShowOnboardForm(false);
    } catch (error) {
      
      alert('Failed to onboard seller. Please try again.');
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-gray-900">Sellers Management</h1>
        <button
          onClick={() => setShowOnboardForm(true)}
          className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
        >
          + Onboard Seller
        </button>
      </div>

      <AnimatePresence>
        {showOnboardForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
          >
            <h2 className="text-xl font-light text-gray-900 mb-6">Onboard New Seller</h2>
            <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Phone
                </label>
                <input
                  {...register('email')}
                  type="text"
                  id="email"
                  placeholder="email@example.com or +919876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (if not using email)
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="flex-1 bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                >
                  {isOnboarding ? 'Onboarding...' : 'Onboard Seller'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOnboardForm(false);
                    reset();
                  }}
                  disabled={isOnboarding}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note: Seller list would require a backend endpoint to fetch users by role */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">
          Note: To view and manage existing sellers, a backend endpoint to fetch users by role is required.
          For now, you can onboard new sellers using the form above.
        </p>
      </div>
    </motion.div>
  );
}

