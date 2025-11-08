import { z } from 'zod';

/**
 * @typedef {Object} OrderItem
 * @property {string} id - Order item UUID
 * @property {string} productId - Product UUID
 * @property {string} sku - Product SKU
 * @property {string} productName - Product name
 * @property {number} quantity - Item quantity
 * @property {number} unitPrice - Price per unit at time of order
 * @property {number} totalPrice - Total price (unitPrice * quantity)
 * @property {string} [variantId] - Product variant UUID
 */

/**
 * @typedef {'PENDING'|'CONFIRMED'|'SHIPPED'|'DELIVERED'|'CANCELLED'|'RETURNED'} OrderStatus
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Order UUID
 * @property {string} orderNumber - Human-readable order number
 * @property {string} userId - User UUID
 * @property {string} tenantId - Tenant UUID
 * @property {OrderItem[]} items - Order items
 * @property {string} shippingAddressId - Shipping address UUID
 * @property {string} paymentId - Payment UUID
 * @property {OrderStatus} status - Order status
 * @property {number} subtotal - Subtotal
 * @property {number} discountAmount - Discount amount
 * @property {number} taxAmount - Tax amount
 * @property {number} shippingCost - Shipping cost
 * @property {number} total - Final total
 * @property {string} currency - Currency code
 * @property {string} [notes] - Order notes
 * @property {string} [trackingNumber] - Shipping tracking number
 * @property {Date|string} [shippedAt] - Shipment timestamp
 * @property {Date|string} [deliveredAt] - Delivery timestamp
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string} updatedAt - Update timestamp
 */

// Order Status Enum
export const OrderStatusEnum = z.enum([
  'PENDING',
  'PLACED', // Added to match backend OrderStatus.PLACED
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);

// Order Item Schema
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  variantId: z.string().uuid().optional().nullable(),
});

// Order Schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  items: z.array(OrderItemSchema),
  shippingAddressId: z.string().uuid(),
  paymentId: z.string().uuid(),
  status: OrderStatusEnum,
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  notes: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  shippedAt: z.string().datetime().or(z.date()).optional().nullable(),
  deliveredAt: z.string().datetime().or(z.date()).optional().nullable(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

// Create Order Request (typically called by Checkout service)
export const CreateOrderRequestSchema = z.object({
  shippingAddressId: z.string().uuid(),
  paymentId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      sku: z.string().min(1),
      productName: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      totalPrice: z.number().nonnegative(),
    })
  ),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
});

// Update Order Status Request
export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusEnum,
  reason: z.string().optional(),
  changedBy: z.string().uuid().optional(),
});

// Cancel Order Request
export const CancelOrderRequestSchema = z.object({
  reason: z.string().min(1),
});

// Order Summary Schema (for list items - simplified version)
export const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1),
  status: OrderStatusEnum,
  paymentId: z.string().uuid(),
  total: z.number().nonnegative(),
  currency: z.string().default('INR'),
  itemCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime().or(z.date()),
});

// Order List Response (Paginated)
export const OrderListResponseSchema = z.object({
  content: z.array(OrderSummarySchema), // Use OrderSummarySchema for list items
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

// Order Query Parameters
export const OrderQuerySchema = z.object({
  page: z.number().int().nonnegative().default(0),
  size: z.number().int().positive().max(100).default(20),
  status: OrderStatusEnum.optional(),
});

