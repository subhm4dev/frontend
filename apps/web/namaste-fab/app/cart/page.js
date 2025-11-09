'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Cart Page - Enterprise Design
 * 
 * Matches Enterprise CartPage design while preserving all functionality
 */
export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const { data: cart, isLoading, error } = useCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

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

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-neutral-500">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load cart</p>
            <Button onClick={() => window.location.reload()} variant="outline">
            Try again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Calculate totals from cart data
  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shippingCost || (subtotal > 999 ? 0 : 99);
  const total = cart?.total || (subtotal + shipping);

  if (isEmpty) {
  return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1">
    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
    >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-neutral-400" />
            </div>
            <h2 className="text-neutral-900 mb-4 text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-neutral-600 mb-6">
              Looks like you haven't added any sarees to your cart yet.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-amber-700 hover:bg-amber-800"
            >
              Continue Shopping
            </Button>
          </motion.div>
        </main>
        <Footer />
          </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-900 mb-8 text-3xl font-semibold"
        >
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md"
                >
                  <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-32 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                  {/* Details */}
                    <div className="flex-1 min-w-0">
                    <h3 className="text-neutral-900 mb-1 line-clamp-1 font-medium">
                      {item.productName}
                    </h3>
                    {item.sku && (
                      <div className="text-sm text-neutral-500 mb-2">
                        SKU: {item.sku}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-neutral-900 font-semibold">
                        {formatPrice(item.unitPrice, cart?.currency || 'INR')}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updateItemMutation.isPending || removeItemMutation.isPending}
                          className="p-1 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4 text-neutral-700" />
                        </motion.button>
                        <span className="w-8 text-center text-neutral-900 font-medium">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateItemMutation.isPending}
                          className="p-1 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 text-neutral-700" />
                        </motion.button>
                      </div>

                      <Separator orientation="vertical" className="h-6" />

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </motion.button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-neutral-900 font-semibold">
                      {formatPrice(item.totalPrice, cart?.currency || 'INR')}
                    </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          {/* Order Summary */}
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <h2 className="text-neutral-900 mb-6 text-xl font-semibold">Order Summary</h2>
                
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                  <span>{formatPrice(subtotal, cart?.currency || 'INR')}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(cart.discountAmount, cart.currency || 'INR')}</span>
                    </div>
                  )}
                {cart?.taxAmount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span>{formatPrice(cart.taxAmount, cart.currency || 'INR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping, cart?.currency || 'INR')}</span>
                </div>
                {shipping === 0 && subtotal > 999 && (
                  <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    🎉 You saved ₹99 on shipping!
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-neutral-900 mb-6 text-lg font-semibold">
                      <span>Total</span>
                <span>{formatPrice(total, cart?.currency || 'INR')}</span>
                </div>

              <Button
                  onClick={handleProceedToCheckout}
                size="lg"
                className="w-full bg-amber-700 hover:bg-amber-800 group"
                >
                  Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <div className="text-sm text-amber-900 mb-1 font-medium">Secure Checkout</div>
                <div className="text-xs text-amber-700">
                  Your payment information is encrypted and secure
                </div>
              </div>
            </div>
          </motion.div>
          </div>
      </main>

      <Footer />
    </div>
  );
}
