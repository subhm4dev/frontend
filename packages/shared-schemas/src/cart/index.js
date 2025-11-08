import { z } from 'zod';

/**
 * @typedef {Object} CartItem
 * @property {string} id - Cart item UUID
 * @property {string} productId - Product UUID
 * @property {string} productName - Product name
 * @property {string} sku - Product SKU
 * @property {number} quantity - Item quantity
 * @property {number} unitPrice - Price per unit
 * @property {number} totalPrice - Total price (unitPrice * quantity)
 * @property {string} [variantId] - Product variant UUID (if applicable)
 * @property {string} [image] - Product image URL
 */

/**
 * @typedef {Object} Cart
 * @property {string} id - Cart UUID
 * @property {string} userId - User UUID
 * @property {string} tenantId - Tenant UUID
 * @property {CartItem[]} items - Cart items
 * @property {number} subtotal - Subtotal (sum of item total prices)
 * @property {number} discountAmount - Total discount amount
 * @property {number} taxAmount - Tax amount
 * @property {number} shippingCost - Shipping cost
 * @property {number} total - Final total (subtotal - discount + tax + shipping)
 * @property {string} currency - Currency code
 * @property {string} [couponCode] - Applied coupon code
 * @property {Date|string} [updatedAt] - Last update timestamp
 */

// Cart Item Schema
export const CartItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  variantId: z.string().uuid().optional().nullable(),
  image: z.string().url().optional(),
});

// Cart Schema
export const CartSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  items: z.array(CartItemSchema).default([]),
  subtotal: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  currency: z.string().default('INR'),
  couponCode: z.string().optional().nullable(),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

// Add to Cart Request
export const AddToCartRequestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  variantId: z.string().uuid().optional().nullable(),
});

// Update Cart Item Request
export const UpdateCartItemRequestSchema = z.object({
  quantity: z.number().int().positive(),
});

// Apply Coupon Request
export const ApplyCouponRequestSchema = z.object({
  couponCode: z.string().min(1),
});

// Cart Response (same as Cart schema)
export const CartResponseSchema = CartSchema;

