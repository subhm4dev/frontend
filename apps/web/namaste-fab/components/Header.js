'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useCart } from '@/hooks/useCart';
import { AuthModal } from './AuthModal';

/**
 * Header Component
 * 
 * Clean, professional navigation header with subtle Odia accents.
 * Elegant design appealing to all age groups.
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
    // Optional: debounced search on change
    // For now, search only on Enter key or button click
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        {/* Subtle Accent Line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>

        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - Elegant and Minimal */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/namastefab.png" 
                  alt="Namaste Fab Logo" 
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Namaste Fab
                </h1>
                <p className="text-xs text-gray-500">Authentic Indian Sarees</p>
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-8">
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
                  className="w-full px-4 py-2.5 pl-12 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={onFilterToggle}
                className="lg:hidden p-2 text-gray-600 hover:text-amber-900 transition-colors"
                aria-label="Toggle filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>

              {/* Cart */}
              {isAuthenticated && (
                <button 
                  onClick={() => router.push('/cart')}
                  className="relative p-2 text-gray-600 hover:text-amber-900 transition-colors"
                  aria-label="Shopping cart"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-amber-900 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-medium px-1">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Admin Dashboard Link */}
                  {user?.roles?.includes('ADMIN') && (
                    <a
                      href="/admin"
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-900 text-white rounded-md hover:bg-amber-800 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </a>
                  )}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-md border border-amber-200">
                    <div className="w-8 h-8 bg-amber-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLogin}
                  className="px-4 py-2 bg-amber-900 text-white rounded-md hover:bg-amber-800 transition-colors shadow-sm font-medium text-sm"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="md:hidden px-4 pb-4">
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
              className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 text-sm"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </header>

      {/* Auth Modal */}
      <AuthModal />
    </>
  );
}
