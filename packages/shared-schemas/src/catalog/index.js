import { z } from 'zod';

/**
 * @typedef {Object} Product
 * @property {string} id - Product UUID
 * @property {string} name - Product name
 * @property {string} sku - Product SKU
 * @property {string} [description] - Product description
 * @property {number} price - Product price
 * @property {string} currency - Currency code (e.g., "INR", "USD")
 * @property {string} [categoryId] - Category UUID
 * @property {string[]} [images] - Product image URLs
 * @property {'ACTIVE'|'INACTIVE'|'DELETED'} [status] - Product status
 * @property {string} [sellerId] - Seller UUID
 * @property {string} [tenantId] - Tenant UUID
 * @property {Date|string} [createdAt] - Creation timestamp
 * @property {Date|string} [updatedAt] - Update timestamp
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Category UUID
 * @property {string} name - Category name
 * @property {string} [description] - Category description
 * @property {string} [parentId] - Parent category UUID (for subcategories)
 * @property {string} [tenantId] - Tenant UUID
 * @property {Date|string} [createdAt] - Creation timestamp
 * @property {Date|string} [updatedAt] - Update timestamp
 */

/**
 * @typedef {Object} SubCategory
 * @property {string} id - Subcategory UUID
 * @property {string} name - Subcategory name
 * @property {string} [description] - Subcategory description
 * @property {string} parentId - Parent category UUID
 * @property {string} [tenantId] - Tenant UUID
 */

// Product Status Enum
export const ProductStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'DELETED']);

// Product Schema
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('INR'),
  categoryId: z.string().uuid().optional().nullable(),
  // Images: Accept any string array (URL validation can be done at display time)
  images: z.array(z.string()).optional().default([]),
  status: ProductStatusEnum.optional().default('ACTIVE'),
  sellerId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  // Accept ISO datetime strings or Date objects (lenient validation)
  createdAt: z.union([z.string(), z.date(), z.coerce.date()]).optional(),
  updatedAt: z.union([z.string(), z.date(), z.coerce.date()]).optional(),
});

// Category Schema
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  tenantId: z.string().uuid().optional(),
  createdAt: z.string().datetime().or(z.date()).optional(),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

// SubCategory Schema (same as Category but with required parentId)
export const SubCategorySchema = CategorySchema.extend({
  parentId: z.string().uuid(),
});

// Create Product Request
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('INR'),
  categoryId: z.string().uuid().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  status: ProductStatusEnum.optional().default('ACTIVE'),
});

// Update Product Request
export const UpdateProductRequestSchema = CreateProductRequestSchema.partial();

// Create Category Request
export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
});

// Update Category Request
export const UpdateCategoryRequestSchema = CreateCategoryRequestSchema.partial();

// Product Search Request
export const ProductSearchRequestSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  page: z.number().int().nonnegative().default(0),
  size: z.number().int().positive().max(100).default(20),
  status: ProductStatusEnum.optional(),
  tenantId: z.string().uuid().optional(), // Optional tenant ID for public browsing
});

// Product List Response (Paginated)
export const ProductListResponseSchema = z.object({
  content: z.array(ProductSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

// Category List Response
export const CategoryListResponseSchema = z.array(CategorySchema);

