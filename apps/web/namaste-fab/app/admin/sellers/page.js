'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterRequestSchema } from '@ecom/shared-schemas';
import { authApi } from '@ecom/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Admin Sellers Management Page
 * 
 * Onboard new sellers and manage existing sellers.
 * Matches Enterprise design.
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
      <div className="mb-8">
        <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">Sellers Management</h1>
        <p className="text-neutral-600">Onboard and manage sellers</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowOnboardForm(true)}
          className="bg-amber-700 hover:bg-amber-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Onboard Seller
        </Button>
      </div>

      <AnimatePresence>
        {showOnboardForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Onboard New Seller</CardTitle>
                  <Button
                    onClick={() => {
                      setShowOnboardForm(false);
                      reset();
                    }}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="seller-email">
                      Email or Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('email')}
                      id="seller-email"
                      type="text"
                      placeholder="email@example.com or +919876543210"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="seller-fullName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('fullName')}
                      id="seller-fullName"
                      type="text"
                      placeholder="Seller's full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="seller-password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('password')}
                      id="seller-password"
                      type="password"
                      placeholder="Minimum 8 characters"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isOnboarding}
                      className="flex-1 bg-amber-700 hover:bg-amber-800"
                    >
                      {isOnboarding ? 'Onboarding...' : 'Onboard Seller'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowOnboardForm(false);
                        reset();
                      }}
                      disabled={isOnboarding}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note: Seller list would require a backend endpoint to fetch users by role */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-neutral-500 mb-4">
              To view and manage existing sellers, a backend endpoint to fetch users by role is required.
            </p>
            <p className="text-sm text-neutral-400">
              For now, you can onboard new sellers using the form above.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
