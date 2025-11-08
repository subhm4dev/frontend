'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

export default function Home() {
  const { isAuthenticated, user, isLoading, checkAuthStatus, logout } = useAuthStore();
  const { openLogin, openRegister } = useAuthModal();

  // Check auth status on page load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Not authenticated, open login modal
      openLogin();
      return;
    }
    // Authenticated, proceed with add to cart
    alert('Add to cart functionality - coming soon!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold mb-8">Namaste Fab</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : isAuthenticated ? (
          // User is authenticated - show user info
          <div className="w-full space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
              <p><strong>Tenant ID:</strong> {user?.tenantId}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Add to Cart
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          // User is not authenticated - show login/register buttons
          <div className="w-full space-y-4">
            <p className="text-lg">Browse our collection of beautiful Indian dresses and fabrics</p>
            
            <div className="flex gap-4">
              <button
                onClick={openLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Login
              </button>
              <button
                onClick={openRegister}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Register
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Add to Cart (requires login)
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <LoginModal />
        <RegisterModal />
      </main>
    </div>
  );
}