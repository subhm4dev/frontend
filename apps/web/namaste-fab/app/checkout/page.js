'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/hooks/useCart';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import { useCheckoutInitiate, useCheckoutComplete } from '@/hooks/useCheckout';
import { useCreateOrder, useProcessPayment } from '@/hooks/usePayment';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { initializeRazorpayCheckout } from '@/lib/razorpay';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckoutSteps, AddressForm } from '@ecom/components';

/**
 * Checkout Page
 * 
 * Simplified checkout flow:
 * 1. Address selection/creation
 * 2. Review order
 * 3. Place order → Opens Razorpay modal → Complete payment → Confirmation
 * 
 * Payment is handled entirely through Razorpay checkout modal - no need to collect
 * payment details beforehand.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  
  // Track processed payment IDs to prevent duplicate handler calls
  const processedPaymentIds = useRef(new Set());
  const isProcessingPayment = useRef(false);

  const { data: cart } = useCart();
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const initiateCheckoutMutation = useCheckoutInitiate();
  const completeCheckoutMutation = useCheckoutComplete();
  const createOrderMutation = useCreateOrder();
  const processPaymentMutation = useProcessPayment();

  // Get loading state and auth check status from auth store
  const { isLoading: authLoading, hasCheckedAuth } = useAuthStore();

  // Wait for auth check to complete before redirecting
  // Don't redirect if auth is still loading or hasn't been checked yet
  if (hasCheckedAuth && !isAuthenticated) {
    // Auth check completed and user is not authenticated
    openLogin();
    router.push('/');
    return null;
  }

  // Show loading state while checking auth (or if not checked yet)
  if (authLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to cart if cart is empty (unless we're on the success step)
  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated && currentStep !== 3 && !orderConfirmation) {
      if (!cart || !cart.items || cart.items.length === 0) {
        router.push('/cart');
      }
    }
  }, [hasCheckedAuth, isAuthenticated, currentStep, orderConfirmation, cart, router]);

  // Step 1: Address Selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
  };

  const handleAddressCreate = async (addressData) => {
    try {
      const newAddress = await createAddressMutation.mutateAsync(addressData);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleAddressEdit = (addressId) => {
    setEditingAddressId(addressId);
    setShowAddressForm(true);
  };

  const handleAddressUpdate = async (addressData) => {
    try {
      const updatedAddress = await updateAddressMutation.mutateAsync({
        addressId: editingAddressId,
        data: addressData,
      });
      setSelectedAddressId(updatedAddress.id);
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddressStepNext = async () => {
    if (!selectedAddressId) {
      alert('Please select or create an address');
      return;
    }

    // Initiate checkout to get order summary
    try {
      const summary = await initiateCheckoutMutation.mutateAsync({
        shippingAddressId: selectedAddressId,
      });
      setOrderSummary(summary);
      setCurrentStep(2); // Go directly to review (skip payment method selection)
    } catch (error) {
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  // Step 2: Review and Place Order
  const handlePlaceOrder = async () => {
    // Prevent checkout if already on success step
    if (currentStep === 3) {
      return;
    }

    // Prevent checkout if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty. Please add items to your cart before checkout.');
      router.push('/cart');
      return;
    }

    if (!selectedAddressId) {
      alert('Please select an address');
      return;
    }

    if (!orderSummary) {
      alert('Please complete address selection first');
      return;
    }

    // Prevent duplicate submissions
    if (completeCheckoutMutation.isPending || processPaymentMutation.isPending || createOrderMutation.isPending) {
      return;
    }

    setPaymentError(null);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await createOrderMutation.mutateAsync({
        orderId: orderSummary?.orderId || crypto.randomUUID(),
        amount: orderSummary?.total || cart?.total || 0,
        currency: orderSummary?.currency || cart?.currency || 'INR',
      });

      // Step 2: Open Razorpay checkout modal
        const razorpayOptions = {
        order_id: orderResponse.razorpayOrderId,
          amount: (orderSummary?.total || cart?.total || 0) * 100, // Convert to paise
          currency: orderSummary?.currency || cart?.currency || 'INR',
          name: 'Namaste Fab',
          description: `Order checkout`,
          handler: async (response) => {
            const paymentId = response.razorpay_payment_id;
            
            // Prevent duplicate handler calls using payment ID tracking
            if (processedPaymentIds.current.has(paymentId)) {
              return;
            }
            
            // Prevent concurrent processing
            if (isProcessingPayment.current) {
              return;
            }
            
            // Additional guard: check if checkout already completed
            if (currentStep === 3 || orderConfirmation) {
              processedPaymentIds.current.add(paymentId);
              return;
            }

            // Mark as processing and add to processed set immediately
            isProcessingPayment.current = true;
            processedPaymentIds.current.add(paymentId);

            try {
            // Step 3: Complete checkout with Razorpay payment_id
            // The checkout service will verify the payment with the payment service
              const confirmation = await completeCheckoutMutation.mutateAsync({
                shippingAddressId: selectedAddressId,
                paymentGatewayTransactionId: paymentId,
              });

              setOrderConfirmation(confirmation);
            setCurrentStep(3); // Success step
            setPaymentError(null);
            } catch (error) {
              // Check if error is due to empty cart
              if (error.response?.data?.message?.includes('Cart is empty') || 
                  error.message?.includes('Cart is empty')) {
                setPaymentError({
                  message: 'Your cart was cleared. Please add items to your cart and try again.',
                  canRetry: false,
                });
                // Redirect to cart after a delay
                setTimeout(() => {
                  router.push('/cart');
                }, 2000);
              } else {
                setPaymentError({
                  message: 'Payment processed but failed to complete order. Please try again.',
                  canRetry: true,
                });
              }
            } finally {
              // Always reset processing flag
              isProcessingPayment.current = false;
            }
        },
        modal: {
          ondismiss: function () {
            // User closed the modal without completing payment
            setPaymentError({
              message: 'Payment was cancelled. Please try again to complete your order.',
              canRetry: true,
            });
          },
          },
          prefill: {
            name: selectedAddress?.fullName || '',
            email: useAuthStore.getState().user?.email || '',
            contact: selectedAddress?.phone || '',
          },
          theme: {
            color: '#92400E', // Amber-900
          },
        };

        await initializeRazorpayCheckout(razorpayOptions);
    } catch (error) {
      setPaymentError({
        message: error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.',
        canRetry: true,
      });
    }
  };

  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId);

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

      <main className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Checkout</h1>

        {/* Checkout Steps */}
        <CheckoutSteps currentStep={currentStep} steps={['Address', 'Review', 'Confirmation']} />

        <AnimatePresence mode="wait">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-light text-gray-900 mb-6">Shipping Address</h2>

              {showAddressForm ? (
                <AddressForm
                  defaultValues={editingAddressId ? addresses?.find(a => a.id === editingAddressId) : undefined}
                  onSubmit={editingAddressId ? handleAddressUpdate : handleAddressCreate}
                  onCancel={handleAddressFormCancel}
                  isLoading={editingAddressId ? updateAddressMutation.isPending : createAddressMutation.isPending}
                  mode={editingAddressId ? 'edit' : 'create'}
                />
              ) : (
                <>
                  {/* Loading State */}
                  {addressesLoading && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading addresses...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {addressesError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        Failed to load addresses. Please try again.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                      >
                        Reload
                      </button>
                    </div>
                  )}

                  {/* Address List */}
                  {!addressesLoading && !addressesError && (
                    <div className="space-y-3 mb-6">
                      {addresses && addresses.length > 0 ? (
                        addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`w-full p-4 rounded-lg border-2 transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-amber-900 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAddressSelect(address.id)}
                            className="flex-1 text-left"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{address.fullName || 'N/A'}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.street}
                                {address.street2 && `, ${address.street2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-gray-600">{address.phone}</p>
                              )}
                            </div>
                          </motion.button>
                          <div className="flex items-center gap-2 ml-4">
                            {selectedAddressId === address.id && (
                              <svg className="w-6 h-6 text-amber-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddressEdit(address.id);
                              }}
                              className="px-3 py-1.5 text-sm text-amber-900 border border-amber-900 rounded-md hover:bg-amber-50 transition-colors"
                            >
                              Edit
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No addresses found. Add your first address below.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-amber-900 hover:text-amber-900 transition-colors"
                  >
                    + Add New Address
                  </button>

                  <div className="flex justify-end mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddressStepNext}
                      disabled={!selectedAddressId || initiateCheckoutMutation.isPending}
                      className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {initiateCheckoutMutation.isPending ? 'Loading...' : 'Review Order'}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && orderSummary && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-light text-gray-900 mb-6">Review Your Order</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {orderSummary.items?.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.totalPrice, orderSummary.currency)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderSummary.subtotal, orderSummary.currency)}</span>
                </div>
                {orderSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(orderSummary.discountAmount, orderSummary.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(orderSummary.taxAmount, orderSummary.currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(orderSummary.shippingCost, orderSummary.currency)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(orderSummary.total, orderSummary.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedAddress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping To:</h3>
                  <p className="text-sm text-gray-600">{selectedAddress.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.street}
                    {selectedAddress.street2 && `, ${selectedAddress.street2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                  </p>
                </div>
              )}

              {/* Payment Error */}
              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 mb-3">{paymentError.message}</p>
                  {paymentError.canRetry && (
                    <button
                      onClick={() => {
                        // Check if cart is still available before retrying
                        if (!cart || !cart.items || cart.items.length === 0) {
                          alert('Your cart is empty. Please add items to your cart before trying again.');
                          router.push('/cart');
                          return;
                        }
                        setPaymentError(null);
                        handlePlaceOrder();
                      }}
                      className="text-sm text-red-700 hover:text-red-800 underline font-medium"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={
                    completeCheckoutMutation.isPending || 
                    processPaymentMutation.isPending || 
                    createOrderMutation.isPending ||
                    currentStep === 3 ||
                    !cart ||
                    !cart.items ||
                    cart.items.length === 0
                  }
                  className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {completeCheckoutMutation.isPending || processPaymentMutation.isPending || createOrderMutation.isPending
                    ? 'Processing...'
                    : !cart || !cart.items || cart.items.length === 0
                    ? 'Cart is Empty'
                    : 'Place Order & Pay'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && orderConfirmation && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h2 className="text-2xl font-light text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your order number is <span className="font-semibold">{orderConfirmation.orderNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                You will receive an email confirmation shortly.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/orders')}
                  className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
                >
                  View Orders
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </motion.div>
  );
}

