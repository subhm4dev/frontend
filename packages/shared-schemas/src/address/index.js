import { z } from 'zod';

/**
 * @typedef {'HOME'|'WORK'|'OTHER'} AddressType
 */

/**
 * @typedef {Object} Address
 * @property {string} id - Address UUID
 * @property {string} userId - User UUID
 * @property {string} tenantId - Tenant UUID
 * @property {string} [fullName] - Recipient full name
 * @property {string} phone - Phone number
 * @property {string} street - Street address
 * @property {string} [street2] - Street address line 2
 * @property {string} city - City
 * @property {string} state - State/Province
 * @property {string} postalCode - Postal/ZIP code
 * @property {string} country - Country code (e.g., "IN", "US")
 * @property {AddressType} [type] - Address type
 * @property {boolean} [isDefault] - Whether this is the default address
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string} updatedAt - Update timestamp
 */

// Address Type Enum
export const AddressTypeEnum = z.enum(['HOME', 'WORK', 'OTHER']);

// Address Schema
export const AddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  fullName: z.string().optional().nullable(),
  phone: z
    .union([
      z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)'),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable(),
  street: z.string().min(1),
  street2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2).default('IN'), // ISO 3166-1 alpha-2
  type: AddressTypeEnum.optional().default('HOME'),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime().or(z.date()).optional(),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

// Create Address Request
export const CreateAddressRequestSchema = z.object({
  fullName: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)'),
  street: z.string().min(1),
  street2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2).default('IN'),
  type: AddressTypeEnum.optional().default('HOME'),
  isDefault: z.boolean().optional().default(false),
});

// Update Address Request
export const UpdateAddressRequestSchema = CreateAddressRequestSchema.partial();

// Address List Response
export const AddressListResponseSchema = z.array(AddressSchema);

