'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ShoppingCart, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';

/**
 * Header Component - Enterprise Design
 * 
 * Matches Enterprise Navbar design while preserving all existing functionality
 */

export function Header({ onFilterToggle, onSearch, searchQuery: externalSearchQuery }) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openLogin } = useAuthModal();
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  
  // Calculate cart item count
  const cartItemCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  
  // Sync with external searchQuery prop
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button
              onClick={() => handleNavigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">साड़ी</span>
              </div>
              <div>
                <div className="text-neutral-900 tracking-tight font-semibold">Namaste Fab</div>
                <div className="text-xs text-neutral-500">Handloom Heritage</div>
              </div>
            </motion.button>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                  <motion.button
                    onClick={() => handleNavigate('/catalog')}
                    whileHover={{ scale: 1.05 }}
                    className="text-neutral-700 hover:text-amber-700 transition-colors"
                  >
                    Catalog
                  </motion.button>
              {isAuthenticated && (
                <motion.button
                  onClick={() => handleNavigate('/orders')}
                  whileHover={{ scale: 1.05 }}
                  className="text-neutral-700 hover:text-amber-700 transition-colors"
                >
                  Orders
                </motion.button>
              )}
              {user?.roles?.includes('ADMIN') && (
                <motion.button
                  onClick={() => handleNavigate('/admin')}
                  whileHover={{ scale: 1.05 }}
                  className="text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </motion.button>
              )}
            </div>

            {/* Search Bar (Desktop) - Preserved from original */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search sarees, fabrics, patterns..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className="w-full px-4 py-2 pl-12 pr-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-amber-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle (Mobile) */}
              {onFilterToggle && (
              <button
                onClick={onFilterToggle}
                  className="lg:hidden p-2 text-neutral-600 hover:text-amber-700 transition-colors"
                aria-label="Toggle filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              )}

              {/* Cart */}
              {isAuthenticated && (
                <motion.button
                  onClick={() => handleNavigate('/cart')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 text-neutral-700 hover:text-amber-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </motion.button>
              )}

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleNavigate('/profile')}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                    <User className="w-4 h-4 text-neutral-700" />
                    <span className="text-neutral-700 hidden md:inline">{user?.email?.split('@')[0] || 'User'}</span>
                  </motion.button>
                  <motion.button
                    onClick={logout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-neutral-700 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <Button onClick={openLogin} variant="default" className="bg-amber-700 hover:bg-amber-800">
                  Login / Register
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="lg:hidden px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sarees..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              className="w-full px-4 py-2 pl-10 pr-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-sm"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-amber-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal />
    </>
  );
}
