'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@ecom/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OrderCard } from '@ecom/components';

/**
 * Orders Page
 * 
 * Displays user's order history with:
 * - Order list with status badges
 * - Filter by status
 * - Click to view order details
 */
export default function OrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: ordersData, isLoading, error } = useOrders({
    page: currentPage,
    size: 10,
    status: statusFilter || undefined,
  });

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load orders</p>
          <button
            onClick={() => window.location.reload()}
            className="text-amber-900 hover:text-amber-800 transition-colors"
          >
            Try again
          </button>
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

      <main className="container mx-auto px-4 py-12 lg:py-16">
        <h1 className="text-3xl font-light text-gray-900 mb-8">My Orders</h1>

        {/* Status Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          >
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 mb-4">No orders found</p>
            <button
              onClick={() => router.push('/')}
              className="text-amber-900 hover:text-amber-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => router.push(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-8">
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
      </main>

      <Footer />
    </motion.div>
  );
}

