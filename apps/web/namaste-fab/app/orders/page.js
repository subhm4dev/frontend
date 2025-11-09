'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@ecom/utils';
import { Button } from '@/components/ui/button';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-neutral-500">Loading orders...</p>
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
            className="text-amber-700 hover:text-amber-800 transition-colors"
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
      className="min-h-screen flex flex-col bg-neutral-50"
    >
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-900 mb-8 text-3xl font-semibold"
        >
          My Orders ({orders.length})
        </motion.h1>

        {/* Status Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-24"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-neutral-400" />
            </div>
            <h2 className="text-neutral-900 mb-4 text-2xl font-semibold">No orders yet</h2>
            <p className="text-neutral-600 mb-6">
              When you place an order, it will appear here.
            </p>
            <Button onClick={() => router.push('/')} className="bg-amber-700 hover:bg-amber-800">
              Start Shopping
            </Button>
          </motion.div>
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
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          ? 'text-amber-700 font-medium'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {displayPage}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-neutral-400">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

