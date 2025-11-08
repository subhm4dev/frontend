import { z } from 'zod';

/**
 * @typedef {Object} Profile
 * @property {string} id - Profile UUID
 * @property {string} userId - User UUID
 * @property {string} tenantId - Tenant UUID
 * @property {string} [fullName] - User's full name
 * @property {string} [phone] - Phone number
 * @property {string} [avatarUrl] - Avatar image URL
 * @property {Date|string} createdAt - Creation timestamp
 * @property {Date|string} updatedAt - Update timestamp
 */

// Profile Schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  fullName: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)')
    .optional()
    .nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

// Create or Update Profile Request
export const CreateProfileRequestSchema = z.object({
  fullName: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)')
    .optional()
    .nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

// Update Profile Request (same as create, all fields optional)
export const UpdateProfileRequestSchema = CreateProfileRequestSchema.partial();

