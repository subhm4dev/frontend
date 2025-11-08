'use client';

import { motion } from 'motion/react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@ecom/utils';
import { OrderCard } from '@ecom/components';

/**
 * Admin Dashboard Home
 * 
 * Overview metrics and recent orders.
 */
export default function AdminDashboardPage() {
  const { data: recentOrders } = useOrders({ page: 0, size: 5 });

  // Calculate metrics (mock for now - would come from analytics API)
  const metrics = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeSellers: 0,
  };

  const orders = recentOrders?.content || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-light text-gray-900 mb-8">Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(metrics.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Sellers</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.activeSellers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-gray-900">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-sm text-amber-900 hover:text-amber-800 font-medium transition-colors"
          >
            View All →
          </a>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => window.location.href = `/admin/orders/${order.id}`}
                showUserInfo={true}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

