'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';

/**
 * Admin Layout
 * 
 * Admin-specific layout with sidebar navigation.
 * Protected route (middleware checks ADMIN role).
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { openLogin } = useAuthModal();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin()) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/sellers', label: 'Sellers', icon: '👥' },
    { path: '/admin/addresses', label: 'Addresses', icon: '📍' },
    { path: '/admin/catalog', label: 'Catalog', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Namaste Fab</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
            return (
              <motion.button
                key={item.path}
                whileHover={{ x: 4 }}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-amber-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path)))?.label || 'Admin'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {user?.email || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

