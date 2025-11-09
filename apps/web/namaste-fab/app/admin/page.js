'use client';

import { motion } from 'motion/react';
import { Users, Package, ShoppingCart, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@ecom/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@ecom/components';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
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
          {[
            {
              title: 'Total Revenue',
              value: formatPrice(metrics.totalRevenue),
              change: '+18%',
              icon: DollarSign,
              color: 'bg-green-100 text-green-700',
            },
            {
              title: 'Total Orders',
              value: metrics.totalOrders.toString(),
              change: '+12%',
              icon: ShoppingCart,
              color: 'bg-blue-100 text-blue-700',
            },
            {
              title: 'Total Products',
              value: '328',
              change: '+5%',
              icon: Package,
              color: 'bg-purple-100 text-purple-700',
            },
            {
              title: 'Active Users',
              value: '2,847',
              change: '+24%',
              icon: Users,
              color: 'bg-orange-100 text-orange-700',
            },
          ].map((stat, index) => (
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

      {/* Recent Orders */}
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
          </CardContent>
        </Card>
      </main>
      <Footer />
      </div>
  );
}

