'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAddresses, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { formatDate } from '@ecom/utils';
import { AddressForm } from '@ecom/components';

/**
 * Admin Addresses Management Page
 * 
 * View and manage all addresses across all users.
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
      
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(addressId);
    } catch (error) {
      
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-gray-900">Addresses Management</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by User ID
          </label>
          <input
            type="text"
            placeholder="Enter user ID (leave empty for all)"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>
      </div>

      {/* Addresses List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading addresses...</p>
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-gray-900">{address.fullName || 'N/A'}</p>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-900 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.street}
                    {address.street2 && `, ${address.street2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    User ID: {address.userId} | Created: {formatDate(address.createdAt, 'short')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="px-4 py-2 text-sm text-amber-900 hover:text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deleteAddressMutation.isPending}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No addresses found</p>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-gray-900">Edit Address</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAddress(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddressForm
              defaultValues={editingAddress}
              onSubmit={handleUpdate}
              onCancel={() => {
                setShowEditForm(false);
                setEditingAddress(null);
              }}
              isLoading={updateAddressMutation.isPending}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

