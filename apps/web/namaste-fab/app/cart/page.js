'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Cart Page
 * 
 * Displays shopping cart with:
 * - Cart items with quantity controls
 * - Cart totals (subtotal, discounts, tax, shipping, total)
 * - Proceed to checkout button
 * - Empty cart state
 */
export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const { data: cart, isLoading, error } = useCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItemMutation.mutateAsync(itemId);
    } else {
      await updateItemMutation.mutateAsync({ itemId, data: { quantity: newQuantity } });
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeItemMutation.mutateAsync(itemId);
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCartMutation.mutateAsync();
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load cart</p>
          <button
            onClick={() => window.location.reload()}
            className="text-amber-900 hover:text-amber-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

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

      <main className="container mx-auto px-4 py-12 lg:py-16">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Shopping Cart</h1>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="text-center py-24">
            <svg
              className="mx-auto h-24 w-24 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{item.productName}</h3>
                      <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.unitPrice, cart?.currency || 'INR')}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updateItemMutation.isPending || removeItemMutation.isPending}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 text-gray-900 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateItemMutation.isPending}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.totalPrice, cart?.currency || 'INR')}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24"
              >
                <h2 className="text-xl font-light text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart?.subtotal || 0, cart?.currency || 'INR')}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(cart.discountAmount, cart.currency || 'INR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(cart?.taxAmount || 0, cart?.currency || 'INR')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>{formatPrice(cart?.shippingCost || 0, cart?.currency || 'INR')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(cart?.total || 0, cart?.currency || 'INR')}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  className="w-full bg-amber-900 text-white font-medium py-3.5 rounded-lg hover:bg-amber-800 transition-colors shadow-lg"
                >
                  Proceed to Checkout
                </motion.button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full mt-3 text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </motion.div>
  );
}

