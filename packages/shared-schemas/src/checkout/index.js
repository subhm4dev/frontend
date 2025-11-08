import { z } from 'zod';

/**
 * @typedef {Object} CheckoutItem
 * @property {string} productId - Product UUID
 * @property {string} sku - Product SKU
 * @property {string} productName - Product name
 * @property {number} quantity - Item quantity
 * @property {number} unitPrice - Price per unit
 * @property {number} totalPrice - Total price (unitPrice * quantity)
 */

/**
 * @typedef {Object} CheckoutInitiateResponse
 * @property {CheckoutItem[]} items - Order items
 * @property {number} subtotal - Subtotal
 * @property {number} discountAmount - Discount amount
 * @property {number} taxAmount - Tax amount
 * @property {number} shippingCost - Shipping cost
 * @property {number} total - Final total
 * @property {string} currency - Currency code
 * @property {boolean} isValid - Whether checkout is valid (all items available, prices current)
 * @property {string[]} [warnings] - Warnings (e.g., price changed, item out of stock)
 */

/**
 * @typedef {Object} CheckoutCompleteResponse
 * @property {string} orderId - Created order UUID
 * @property {string} orderNumber - Human-readable order number
 * @property {string} paymentId - Payment UUID
 * @property {number} total - Order total
 * @property {string} currency - Currency code
 */

// Checkout Item Schema
export const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

// Initiate Checkout Request
export const CheckoutInitiateRequestSchema = z.object({
  shippingAddressId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional().nullable(),
  cartId: z.string().uuid().optional().nullable(),
});

// Checkout Initiate Response
export const CheckoutInitiateResponseSchema = z.object({
  items: z.array(CheckoutItemSchema),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  isValid: z.boolean(),
  warnings: z.array(z.string()).optional().default([]),
});

// Complete Checkout Request
export const CheckoutCompleteRequestSchema = z.object({
  shippingAddressId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional().nullable(),
  paymentGatewayTransactionId: z.string().optional().nullable(), // Razorpay payment_id when payment processed client-side
  cartId: z.string().uuid().optional().nullable(),
});

// Checkout Complete Response
export const CheckoutCompleteResponseSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1),
  paymentId: z.string().uuid(),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
});

