'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProfileRequestSchema } from '@ecom/shared-schemas';
import { useProfile, useCreateOrUpdateProfile } from '@/hooks/useProfile';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AddressForm } from '@ecom/components';

/**
 * Profile Page
 * 
 * User profile management with:
 * - Edit profile (name, phone, avatar)
 * - Address management (list, add, edit, delete)
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createOrUpdateProfileMutation = useCreateOrUpdateProfile();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateProfileRequestSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      avatarUrl: profile?.avatarUrl || '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile, reset]);

  const handleProfileSubmit = async (data) => {
    try {
      await createOrUpdateProfileMutation.mutateAsync(data);
      alert('Profile updated successfully');
    } catch (error) {
      
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAddressCreate = async (addressData) => {
    try {
      await createAddressMutation.mutateAsync(addressData);
      setShowAddressForm(false);
    } catch (error) {
      
    }
  };

  const handleAddressEdit = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddressUpdate = async (addressData) => {
    try {
      await updateAddressMutation.mutateAsync({
        addressId: editingAddress.id,
        data: addressData,
      });
      setEditingAddress(null);
      setShowAddressForm(false);
    } catch (error) {
      
    }
  };

  const handleAddressDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(addressId);
    } catch (error) {
      
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #fef9f3 0%, #ffffff 50%, #fef9f3 100%)',
      }}
    >
      <Header />

      <main className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h1 className="text-3xl font-light text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-light text-gray-900 mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  id="fullName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  {...register('avatarUrl')}
                  type="url"
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
                />
                {errors.avatarUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.avatarUrl.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={createOrUpdateProfileMutation.isPending}
                className="w-full bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrUpdateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </form>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-gray-900">Addresses</h2>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                }}
                className="text-sm text-amber-900 hover:text-amber-800 font-medium transition-colors"
              >
                + Add Address
              </button>
            </div>

            {showAddressForm ? (
              <AddressForm
                defaultValues={editingAddress}
                onSubmit={editingAddress ? handleAddressUpdate : handleAddressCreate}
                onCancel={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                }}
                isLoading={createAddressMutation.isPending || updateAddressMutation.isPending}
              />
            ) : (
              <div className="space-y-3">
                {addressesLoading ? (
                  <p className="text-gray-500 text-sm">Loading addresses...</p>
                ) : addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{address.fullName || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.street}
                            {address.street2 && `, ${address.street2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-900 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddressEdit(address)}
                            className="text-sm text-amber-900 hover:text-amber-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleAddressDelete(address.id)}
                            disabled={deleteAddressMutation.isPending}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No addresses saved</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

