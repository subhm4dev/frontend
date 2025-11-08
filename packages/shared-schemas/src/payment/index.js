import { z } from 'zod';

/**
 * @typedef {'CARD'|'UPI'|'NETBANKING'|'WALLET'|'COD'} PaymentMethodType
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id - Payment method UUID
 * @property {string} userId - User UUID
 * @property {string} tenantId - Tenant UUID
 * @property {PaymentMethodType} type - Payment method type
 * @property {string} [token] - Tokenized payment method (for cards)
 * @property {string} [upiId] - UPI ID (for UPI)
 * @property {string} [last4] - Last 4 digits of card (for display)
 * @property {string} [brand] - Card brand (VISA, MASTERCARD, etc.)
 * @property {boolean} isDefault - Whether this is the default payment method
 * @property {Date|string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} ProcessPaymentRequest
 * @property {string} orderId - Order UUID
 * @property {string} [paymentMethodId] - Saved payment method UUID
 * @property {number} amount - Payment amount
 * @property {string} currency - Currency code
 * @property {Object} [paymentMethod] - New payment method details (if not using saved)
 * @property {string} [phoneNumber] - Phone number (for UPI/COD)
 */

/**
 * @typedef {'PENDING'|'SUCCESS'|'FAILED'|'REFUNDED'|'PARTIALLY_REFUNDED'} PaymentStatus
 */

/**
 * @typedef {Object} PaymentResponse
 * @property {string} paymentId - Payment UUID
 * @property {string} orderId - Order UUID
 * @property {PaymentStatus} status - Payment status
 * @property {number} amount - Payment amount
 * @property {string} currency - Currency code
 * @property {string} [transactionId] - Gateway transaction ID
 * @property {string} [paymentLink] - Payment link (for UPI)
 * @property {string} [qrCode] - QR code (for UPI)
 * @property {string} [errorMessage] - Error message (if failed)
 * @property {Date|string} createdAt - Creation timestamp
 */

// Payment Method Type Enum
export const PaymentMethodTypeEnum = z.enum(['CARD', 'UPI', 'NETBANKING', 'WALLET', 'COD']);

// Payment Status Enum
export const PaymentStatusEnum = z.enum([
  'PENDING',
  'SUCCESS',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

// Payment Method Schema
export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: PaymentMethodTypeEnum,
  token: z.string().optional().nullable(),
  upiId: z.string().optional().nullable(),
  last4: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime().or(z.date()),
});

// New Payment Method Details (for tokenization)
export const NewPaymentMethodSchema = z.object({
  type: PaymentMethodTypeEnum,
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  upiId: z.string().optional(),
});

// Process Payment Request
export const ProcessPaymentRequestSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  paymentMethod: NewPaymentMethodSchema.optional(),
  phoneNumber: z.string().optional(),
  paymentGatewayTransactionId: z.string().optional(), // For verifying payments already processed client-side (e.g., Razorpay payment_id)
});

// Payment Response Schema
export const PaymentResponseSchema = z.object({
  paymentId: z.string().uuid(),
  orderId: z.string().uuid(),
  status: PaymentStatusEnum,
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  transactionId: z.string().optional().nullable(),
  paymentLink: z.string().url().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
  createdAt: z.string().datetime().or(z.date()),
});

// Payment Method List Response
export const PaymentMethodListResponseSchema = z.array(PaymentMethodSchema);

// Create Razorpay Order Request (for client-side checkout)
export const CreateRazorpayOrderRequestSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  paymentMethodType: z.enum(['CARD', 'UPI', 'NETBANKING', 'WALLET', 'COD']).optional(),
});

// Create Razorpay Order Response
export const CreateRazorpayOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  status: z.string(),
});

// Refund Payment Request
export const RefundPaymentRequestSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(), // If not provided, full refund
  reason: z.string().min(1),
});

