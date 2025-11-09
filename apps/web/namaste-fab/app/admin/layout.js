'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { LayoutDashboard, Package, Users, MapPin, BookOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';

/**
 * Admin Layout
 * 
 * Admin-specific layout with sidebar navigation matching Enterprise design.
 * Protected route (middleware checks ADMIN role).
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { openLogin } = useAuthModal();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Orders', icon: Package },
    { path: '/admin/catalog', label: 'Catalog', icon: BookOpen },
    { path: '/admin/sellers', label: 'Sellers', icon: Users },
    { path: '/admin/addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 z-40 shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">साड़ी</span>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900">Admin Panel</h1>
          </div>
          <p className="text-xs text-neutral-500">Namaste Fab</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                whileHover={{ x: 4 }}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <div className="mb-3 px-4 py-2">
            <p className="text-xs text-neutral-500 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.email || 'Admin'}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              {navItems.find((item) => pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path)))?.label || 'Admin'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-600">
                {user?.fullName || user?.email || 'Admin'}
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
