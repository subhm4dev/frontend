'use client';

import { motion } from 'motion/react';
import { formatPrice, formatDate } from '@ecom/utils';

/**
 * OrderCard Component
 * 
 * Reusable order card component.
 * Used in orders list and admin orders page.
 */
export function OrderCard({ order, onClick, showUserInfo = false }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-gray-100 text-gray-800',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                statusColors[order.status] || statusColors.PENDING
              }`}
            >
              {order.status}
            </span>
          </div>

          {showUserInfo && order.userId && (
            <p className="text-sm text-gray-500 mb-2">User ID: {order.userId}</p>
          )}

          <p className="text-sm text-gray-600 mb-2">
            {order.items?.length || order.itemCount || 0} {(order.items?.length || order.itemCount || 0) === 1 ? 'item' : 'items'}
          </p>

          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Order Total */}
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-900 mb-1">
            {formatPrice(order.total, order.currency || 'INR')}
          </p>
          {order.trackingNumber && (
            <p className="text-sm text-gray-500">
              Tracking: {order.trackingNumber}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

