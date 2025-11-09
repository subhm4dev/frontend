'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Trash2, Edit2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProfileRequestSchema } from '@ecom/shared-schemas';
import { useProfile, useCreateOrUpdateProfile } from '@/hooks/useProfile';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-neutral-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-neutral-50"
    >
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-900 mb-8 text-3xl font-semibold"
        >
          My Profile
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                  {...register('fullName')}
                      id="fullName"
                  type="text"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                  {...register('phone')}
                      id="phone"
                  type="tel"
                  placeholder="+919876543210"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
                  {profile && (
                    <>
                      <Separator />
              <div>
                        <div className="text-sm text-neutral-500">Email</div>
                        <div className="text-neutral-900">{user?.email || 'N/A'}</div>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button
                type="submit"
                disabled={createOrUpdateProfileMutation.isPending}
                      className="bg-amber-700 hover:bg-amber-800"
              >
                      Save Changes
                    </Button>
                  </div>
            </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Saved Addresses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Saved Addresses
                  </CardTitle>
                  {!showAddressForm && (
                    <Button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                }}
                      variant="ghost"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  )}
            </div>
              </CardHeader>
              <CardContent>

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
              <>
                {addressesLoading ? (
                  <p className="text-neutral-500 text-sm text-center py-8">Loading addresses...</p>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address, index) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-neutral-200 rounded-lg p-4"
                    >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-500" />
                            <span className="text-neutral-900 font-medium">{address.fullName || 'N/A'}</span>
                          {address.isDefault && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                          <button
                            onClick={() => handleAddressDelete(address.id)}
                            disabled={deleteAddressMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-neutral-600 ml-6">
                          {address.street}
                          {address.street2 && `, ${address.street2}`}
                          <br />
                          {address.city}, {address.state} - {address.postalCode}
                          <br />
                          Phone: {address.phone}
                      </div>
                        {!address.isDefault && (
                          <Button
                            onClick={() => {
                              // Set as default would need API call
                              handleAddressEdit(address);
                            }}
                            variant="ghost"
                            size="sm"
                            className="mt-2 ml-6 text-xs h-7"
                          >
                            Set as Default
                          </Button>
                        )}
                    </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No saved addresses yet
                  </div>
                )}
              </>
            )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

