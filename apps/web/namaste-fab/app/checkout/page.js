'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import { useCheckoutInitiate, useCheckoutComplete } from '@/hooks/useCheckout';
import { useCreateOrder, useProcessPayment } from '@/hooks/usePayment';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { initializeRazorpayCheckout } from '@/lib/razorpay';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-neutral-500">Checking authentication...</p>
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
            color: '#B45309', // Amber-700
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
      className="min-h-screen flex flex-col bg-neutral-50"
    >
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-900 mb-8 text-3xl font-semibold"
        >
          Checkout
        </motion.h1>

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
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-neutral-900 text-xl font-semibold">Delivery Address</h2>
                {!showAddressForm && (
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                )}
              </div>

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
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                      <p className="mt-2 text-sm text-neutral-500">Loading addresses...</p>
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
                            whileHover={{ scale: 1.01 }}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                              selectedAddressId === address.id ? 'border-amber-600 bg-amber-50' : 'border-neutral-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelect(address.id)}
                                className="mt-1"
                              />
                              <label htmlFor={address.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-neutral-500" />
                                  <span className="text-neutral-900 font-medium">{address.fullName || 'N/A'}</span>
                                </div>
                                <div className="text-sm text-neutral-600 ml-6">
                                {address.street}
                                {address.street2 && `, ${address.street2}`}
                                  <br />
                                  {address.city}, {address.state} - {address.postalCode}
                                  <br />
                                  Phone: {address.phone}
                            </div>
                              </label>
                              <Button
                                variant="outline"
                                size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddressEdit(address.id);
                              }}
                            >
                              Edit
                              </Button>
                        </div>
                      </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <p className="text-sm">No addresses found. Add your first address below.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleAddressStepNext}
                      disabled={!selectedAddressId || initiateCheckoutMutation.isPending}
                    className="w-full mt-6 bg-amber-700 hover:bg-amber-800"
                    >
                    Continue to Payment
                  </Button>
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
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h2 className="text-neutral-900 mb-6 text-xl font-semibold">Review Your Order</h2>

              {/* Order Items Summary */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {orderSummary.items?.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-16 h-20 rounded bg-neutral-100 overflow-hidden flex-shrink-0">
                      {/* Product image would go here if available */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-900 line-clamp-1">{item.productName}</div>
                      <div className="text-xs text-neutral-500">Qty: {item.quantity}</div>
                      <div className="text-sm text-neutral-700 font-medium">
                      {formatPrice(item.totalPrice, orderSummary.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary Totals */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderSummary.subtotal, orderSummary.currency)}</span>
                </div>
                {orderSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(orderSummary.discountAmount, orderSummary.currency)}</span>
                  </div>
                )}
                {orderSummary.taxAmount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>{formatPrice(orderSummary.taxAmount, orderSummary.currency)}</span>
                </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{formatPrice(orderSummary.shippingCost, orderSummary.currency)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-neutral-900 mb-6 text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(orderSummary.total, orderSummary.currency)}</span>
              </div>

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

              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
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
                  className="flex-1 bg-amber-700 hover:bg-amber-800"
                >
                  {completeCheckoutMutation.isPending || processPaymentMutation.isPending || createOrderMutation.isPending
                    ? 'Processing...'
                    : !cart || !cart.items || cart.items.length === 0
                    ? 'Cart is Empty'
                    : 'Place Order'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && orderConfirmation && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-neutral-900 mb-4 text-3xl font-semibold"
              >
                Order Placed Successfully!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-600 mb-8"
              >
                Thank you for your purchase. Your order has been confirmed and will be delivered soon.
                {orderConfirmation?.orderNumber && (
                  <span className="block mt-2">
                    Order Number: <span className="font-semibold">{orderConfirmation.orderNumber}</span>
                  </span>
                )}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => router.push('/orders')}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  View Orders
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </motion.div>
  );
}

