'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@ecom/utils';
import { OrderCard } from '@ecom/components';

/**
 * Admin Orders Management Page
 * 
 * List all orders with:
 * - Filter by status, date range, customer
 * - Search orders
 * - Update order status
 */
export default function AdminOrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: ordersData, isLoading } = useOrders({
    page: currentPage,
    size: 20,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 0;

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        data: { status, reason: 'Status updated by admin' },
      });
      setSelectedOrder(null);
      setNewStatus('');
      alert('Order status updated successfully');
    } catch (error) {
      
      alert('Failed to update order status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-gray-900">Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Order number, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <OrderCard
                  order={order}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  showUserInfo={true}
                />
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                  <select
                    value={selectedOrder === order.id ? newStatus : order.status}
                    onChange={(e) => {
                      setSelectedOrder(order.id);
                      setNewStatus(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {selectedOrder === order.id && newStatus !== order.status && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, newStatus)}
                      disabled={updateStatusMutation.isPending}
                      className="px-4 py-2 bg-amber-900 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                  const displayPage = page + 1;
                  if (
                    page === 0 ||
                    page === totalPages - 1 ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm transition-colors ${
                          currentPage === page
                            ? 'text-amber-900 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {displayPage}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

