'use client';

import { motion } from 'motion/react';
import { Users, Package, ShoppingCart, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice } from '@ecom/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Admin Dashboard Home
 * 
 * Overview metrics, charts, and recent orders matching Enterprise design.
 */
export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: recentOrders } = useOrders({ page: 0, size: 5 }, { enabled: isAuthenticated });
  const { data: productsData } = useProducts({ page: 0, size: 100 }, { enabled: isAuthenticated });

  // Calculate metrics from actual data
  const orders = recentOrders?.content || [];
  const products = productsData?.content || [];
  
  // Calculate total revenue from orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const activeUsers = 2847; // Would come from analytics API

  // Mock data for charts (would come from analytics API)
  const salesData = [
    { month: 'Jan', sales: 45000, orders: 120 },
    { month: 'Feb', sales: 52000, orders: 135 },
    { month: 'Mar', sales: 48000, orders: 128 },
    { month: 'Apr', sales: 61000, orders: 158 },
    { month: 'May', sales: 70000, orders: 182 },
    { month: 'Jun', sales: 85000, orders: 210 },
  ];

  const regionData = [
    { name: 'Odisha', value: 45, color: '#f59e0b' },
    { name: 'Bengal', value: 25, color: '#ef4444' },
    { name: 'Tamil Nadu', value: 20, color: '#3b82f6' },
    { name: 'Gujarat', value: 10, color: '#10b981' },
  ];

  const productPerformance = [
    { category: 'Silk', sold: 280, revenue: 560000 },
    { category: 'Cotton', sold: 450, revenue: 180000 },
    { category: 'Handloom', sold: 320, revenue: 288000 },
    { category: 'Bandhani', sold: 180, revenue: 126000 },
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue || 1250000, 'INR'),
      change: '+18%',
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: '+12%',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700',
      trend: 'up',
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+5%',
      icon: Package,
      color: 'bg-purple-100 text-purple-700',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString('en-IN'),
      change: '+24%',
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
      trend: 'up',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-neutral-600">Overview of your saree business</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                      <h3 className="text-neutral-900 mb-2 text-2xl font-semibold">{stat.value}</h3>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">{stat.change}</span>
                        <span className="text-xs text-neutral-500">from last month</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B45309" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#B45309" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#B45309"
                        strokeWidth={2}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regional Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Region</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={regionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {regionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Orders Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={productPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sold" fill="#B45309" name="Units Sold" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <a
                      href="/admin/orders"
                      className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors"
                    >
                      View All →
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-neutral-500 text-center py-8">No recent orders</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Order ID</th>
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Customer</th>
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Amount</th>
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Status</th>
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Date</th>
                            <th className="text-left py-3 px-4 text-sm text-neutral-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <motion.tr
                              key={order.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-neutral-900">{order.orderNumber || order.id}</td>
                              <td className="py-3 px-4 text-sm text-neutral-900">
                                {order.shippingAddress?.fullName || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-900">
                                {formatPrice(order.totalAmount, order.currency || 'INR')}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    order.status === 'DELIVERED'
                                      ? 'bg-green-100 text-green-700'
                                      : order.status === 'SHIPPED'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-600">
                                {new Date(order.orderDate).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-3 px-4">
                                <a
                                  href={`/admin/orders/${order.id}`}
                                  className="text-amber-700 hover:text-amber-800 text-sm flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </a>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
