'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, Search } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@ecom/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Admin Orders Management Page
 * 
 * List all orders with filtering, search, and status updates.
 * Matches Enterprise design.
 */
export default function AdminOrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: ordersData, isLoading } = useOrders({
    page: currentPage,
    size: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 0;

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
      order.shippingAddress?.email?.toLowerCase().includes(query)
    );
  });

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        data: { status, reason: 'Status updated by admin' },
      });
      setSelectedOrder(null);
      setNewStatus('');
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
      <div className="mb-8">
        <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">Orders Management</h1>
        <p className="text-neutral-600">View and manage all orders</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(0);
              }}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-orders">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="search-orders"
                  type="text"
                  placeholder="Order number, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-neutral-500">Loading orders...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-neutral-500 text-center">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-neutral-900 font-semibold">
                            {order.orderNumber || order.id}
                          </h3>
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
                        <p className="text-sm text-neutral-600">
                          Customer: {order.shippingAddress?.fullName || 'N/A'}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Date: {formatDate(order.orderDate)}
                        </p>
                        <p className="text-lg font-semibold text-neutral-900 mt-2">
                          {formatPrice(order.totalAmount, order.currency || 'INR')}
                        </p>
                      </div>
                      <Button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>

                    {/* Order Items Summary */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4 pt-4 border-t border-neutral-200">
                        <p className="text-sm text-neutral-600 mb-2">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {order.items.slice(0, 3).map((item) => (
                            <span
                              key={item.productId}
                              className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded"
                            >
                              {item.productName} (x{item.quantity})
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Update */}
                    <div className="pt-4 border-t border-neutral-200 flex items-center gap-4">
                      <Select
                        value={selectedOrder === order.id ? newStatus : order.status}
                        onValueChange={(value) => {
                          setSelectedOrder(order.id);
                          setNewStatus(value);
                        }}
                      >
                        <SelectTrigger className="w-48">
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
                      {selectedOrder === order.id && newStatus !== order.status && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, newStatus)}
                          disabled={updateStatusMutation.isPending}
                          className="bg-amber-700 hover:bg-amber-800"
                          size="sm"
                        >
                          {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
              >
                ←
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                  const displayPage = page + 1;
                  if (
                    page === 0 ||
                    page === totalPages - 1 ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className={currentPage === page ? 'bg-amber-700 hover:bg-amber-800' : ''}
                      >
                        {displayPage}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-neutral-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="sm"
              >
                →
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
