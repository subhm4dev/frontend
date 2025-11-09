'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, X } from 'lucide-react';
import { useAddresses, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { formatDate } from '@ecom/utils';
import { AddressForm } from '@ecom/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * Admin Addresses Management Page
 * 
 * View and manage all addresses across all users.
 * Matches Enterprise design.
 */
export default function AdminAddressesPage() {
  const [userIdFilter, setUserIdFilter] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: addresses, isLoading } = useAddresses(userIdFilter || undefined);
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowEditForm(true);
  };

  const handleUpdate = async (addressData) => {
    try {
      await updateAddressMutation.mutateAsync({
        addressId: editingAddress.id,
        data: addressData,
      });
      setEditingAddress(null);
      setShowEditForm(false);
    } catch (error) {
      alert('Failed to update address. Please try again.');
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(addressId);
    } catch (error) {
      alert('Failed to delete address. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">Addresses Management</h1>
        <p className="text-neutral-600">View and manage all user addresses</p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="user-filter">Filter by User ID</Label>
            <Input
              id="user-filter"
              type="text"
              placeholder="Enter user ID (leave empty for all)"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Addresses List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-neutral-500">Loading addresses...</p>
            </div>
          </CardContent>
        </Card>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-neutral-900 font-semibold">{address.fullName || 'N/A'}</p>
                        <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                          {address.type || 'HOME'}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {address.street}
                        {address.street2 && `, ${address.street2}`}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-neutral-600">{address.phone}</p>
                      <p className="text-xs text-neutral-500 mt-2">
                        User ID: {address.userId} | Created: {formatDate(address.createdAt, 'short')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(address)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(address.id)}
                        disabled={deleteAddressMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-neutral-500 text-center">No addresses found</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              defaultValues={editingAddress}
              onSubmit={handleUpdate}
              onCancel={() => {
                setShowEditForm(false);
                setEditingAddress(null);
              }}
              isLoading={updateAddressMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
