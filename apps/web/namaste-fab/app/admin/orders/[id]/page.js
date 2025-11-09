'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useQueries } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { catalogApi } from '@ecom/api-client';
import { formatPrice, formatDate } from '@ecom/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

/**
 * Admin Order Detail Page
 * 
 * View complete order information and update order status.
 * Matches Enterprise design.
 */
export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const { data: order, isLoading, error } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();

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

  const handleStatusUpdate = async (status) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        data: { status, reason: 'Status updated by admin' },
      });
      alert('Order status updated successfully');
    } catch (error) {
      alert('Failed to update order status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-neutral-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Order not found</p>
          <Button
            onClick={() => router.push('/admin/orders')}
            className="bg-amber-700 hover:bg-amber-800"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <Button
          onClick={() => router.push('/admin/orders')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">
          Order Details
        </h1>
        <p className="text-neutral-600">Order #{order.orderNumber || order.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const product = productsMap[item.productId];
                  return (
                    <div key={item.productId} className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-neutral-900 font-medium mb-1">{item.productName}</h3>
                        <p className="text-sm text-neutral-500 mb-2">SKU: {item.sku || 'N/A'}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-neutral-600">
                              Unit Price: {formatPrice(item.unitPrice, order.currency || 'INR')}
                            </p>
                          </div>
                          <p className="text-neutral-900 font-semibold">
                            {formatPrice(item.totalPrice, order.currency || 'INR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-neutral-900 font-medium">{order.shippingAddress.fullName || 'N/A'}</p>
                  <p className="text-neutral-600 text-sm">
                    {order.shippingAddress.street}
                    {order.shippingAddress.street2 && `, ${order.shippingAddress.street2}`}
                  </p>
                  <p className="text-neutral-600 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-neutral-600 text-sm">Phone: {order.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Order Number</span>
                  <span className="text-neutral-900 font-medium">{order.orderNumber || order.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Order Date</span>
                  <span className="text-neutral-900">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Status</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'SHIPPED'
                        ? 'bg-orange-100 text-orange-700'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">
                    {formatPrice(order.subtotal || order.totalAmount, order.currency || 'INR')}
                  </span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span className="text-neutral-900">
                      {formatPrice(order.taxAmount, order.currency || 'INR')}
                    </span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="text-neutral-900">
                      {formatPrice(order.shippingCost, order.currency || 'INR')}
                    </span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount, order.currency || 'INR')}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">
                  {formatPrice(order.totalAmount, order.currency || 'INR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={order.status}
                  onValueChange={handleStatusUpdate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {updateStatusMutation.isPending && (
                  <p className="text-sm text-neutral-500">Updating status...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.paymentGatewayTransactionId && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Transaction ID</span>
                    <span className="text-neutral-900 font-mono text-xs">
                      {order.paymentGatewayTransactionId}
                    </span>
                  </div>
                  {order.paymentStatus && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Payment Status</span>
                      <span className="text-neutral-900">{order.paymentStatus}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

