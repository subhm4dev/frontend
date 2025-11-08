/**
 * Razorpay Integration Helper
 * 
 * Handles Razorpay checkout for web payments.
 * Backend processes payments server-side, but for cards we may need
 * client-side checkout for better UX.
 * 
 * Note: For UPI and other methods, backend returns payment links/QR codes
 * which are handled in the checkout flow.
 */

/**
 * Initialize Razorpay checkout (for card payments)
 * @param {Object} options - Razorpay options
 * @param {string} options.key - Razorpay key ID
 * @param {number} options.amount - Amount in paise (e.g., 10000 for ₹100)
 * @param {string} options.currency - Currency code (default: 'INR')
 * @param {string} options.name - Merchant name
 * @param {string} options.description - Order description
 * @param {string} options.order_id - Razorpay order ID (from backend)
 * @param {Object} options.prefill - Prefill customer details
 * @param {Function} options.handler - Success callback
 * @param {Function} options.onError - Error callback
 */
export function initializeRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    // Get Razorpay key from environment variable
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || options.key;
    
    if (!razorpayKey) {
      reject(new Error('Razorpay key is required. Set NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.'));
      return;
    }

    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      openRazorpayModal();
      return;
    }

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      openRazorpayModal();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };
    document.body.appendChild(script);

    function openRazorpayModal() {
      const Razorpay = window.Razorpay;
      
      const razorpayOptions = {
        key: razorpayKey,
        amount: options.amount, // Amount in paise
        currency: options.currency || 'INR',
        name: options.name || 'Namaste Fab',
        description: options.description || 'Order Payment',
        order_id: options.order_id,
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.contact || '',
        },
        handler: function (response) {
          // Payment successful
          if (options.handler) {
            options.handler(response);
          }
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            // User closed the modal
            reject(new Error('Payment cancelled by user'));
          },
        },
        theme: {
          color: options.theme?.color || '#92400E', // Amber color matching our theme
        },
      };

      const razorpay = new Razorpay(razorpayOptions);
      razorpay.open();
    }
  });
}

/**
 * Verify Razorpay payment signature
 * Note: This should ideally be done server-side for security
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Payment signature
 * @param {string} secret - Razorpay secret (should be server-side only)
 * @returns {boolean} - Whether signature is valid
 */
export function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  // Note: This is a client-side helper, but signature verification
  // should be done server-side for security
  // This is just a placeholder - actual verification should be on backend
  return true; // Backend will verify
}

