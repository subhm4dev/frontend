'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useQueries } from '@tanstack/react-query';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { catalogApi } from '@ecom/api-client';
import { formatPrice, formatDate } from '@ecom/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Order Detail Page
 * 
 * Displays complete order information:
 * - Order items
 * - Shipping address
 * - Payment details
 * - Tracking information
 * - Cancel order functionality
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const { data: order, isLoading, error } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  // Fetch product details for each order item to get images
  const productQueries = useQueries({
    queries: (order?.items || []).map((item) => ({
      queryKey: ['product', item.productId],
      queryFn: () => catalogApi.getProduct(item.productId),
      enabled: !!item.productId && !!order,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // Create a map of productId -> product for quick lookup
  const productsMap = productQueries.reduce((acc, query, index) => {
    if (query.data && order?.items?.[index]) {
      acc[order.items[index].productId] = query.data;
    }
    return acc;
  }, {});

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        orderId: order.id,
        data: { reason: 'Customer requested cancellation' },
      });
      alert('Order cancelled successfully');
    } catch (error) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Order not found</p>
          <button
            onClick={() => router.push('/orders')}
            className="text-amber-900 hover:text-amber-800 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

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
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <button onClick={() => router.push('/orders')} className="hover:text-amber-900 transition-colors">
            Orders
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Order #{order.orderNumber}</span>
        </nav>

        {/* Order Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-light text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on {formatDate(order.createdAt, 'long')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'SHIPPED'
                    ? 'bg-purple-100 text-purple-800'
                    : order.status === 'CONFIRMED'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.status}
              </span>
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-light text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => {
                  const product = productsMap[item.productId];
                  const productImage = product?.images?.[0] || null;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex gap-4 py-4 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                      onClick={() => router.push(`/products/${item.productId}`)}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg flex-shrink-0 overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 hover:text-amber-900 transition-colors">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.totalPrice, order.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.unitPrice, order.currency)} each
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6 sticky top-24">
              <h2 className="text-lg font-light text-gray-900">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal, order.currency)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxAmount, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost, order.currency)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(order.total, order.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              {order.trackingNumber && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tracking</h3>
                  <p className="text-sm text-gray-600">#{order.trackingNumber}</p>
                  {order.shippedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Shipped on {formatDate(order.shippedAt, 'short')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

