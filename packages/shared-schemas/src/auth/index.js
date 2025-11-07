import { z } from 'zod';

/**
 * @typedef {Object} LoginRequest
 * @property {string} [email] - Email address (optional, but email or phone required)
 * @property {string} [phone] - Phone in E.164 format, e.g., +919876543210 (optional, but email or phone required)
 * @property {string} password - Password (required, min 8 characters)
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} [email] - Email address (optional, but email or phone required)
 * @property {string} [phone] - Phone in E.164 format, e.g., +919876543210 (optional, but email or phone required)
 * @property {string} password - Password (required, min 8 characters)
 * @property {string} [tenantId] - Tenant UUID (optional, backend auto-assigns for customers)
 * @property {'CUSTOMER'|'SELLER'|'ADMIN'|'STAFF'|'DRIVER'} [role] - User role (defaults to 'CUSTOMER')
 */

/**
 * @typedef {Object} RefreshRequest
 * @property {string} refreshToken - JWT refresh token (required)
 */

/**
 * @typedef {Object} LogoutRequest
 * @property {string} refreshToken - JWT refresh token (required)
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {number} expiresIn - Seconds until access token expires
 * @property {string} id - User ID
 * @property {string[]} role - User roles array
 * @property {string} tenantId - Tenant ID
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {string} token - JWT access token (note: backend returns "token" not "accessToken")
 * @property {string} refreshToken - JWT refresh token
 * @property {string} id - User ID
 * @property {string[]} role - User roles array
 * @property {string} tenantId - Tenant ID
 */

/**
 * @typedef {Object} RefreshResponse
 * @property {string} accessToken - New JWT access token
 * @property {number} expiresIn - Seconds until access token expires
 */

// Login Request - email OR phone required
export const LoginRequestSchema = z.object({
  email: z
    .union([z.email(), z.literal('')])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  phone: z
    .union([
      z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)'),
      z.literal('')
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

// Register Request - email OR phone required
export const RegisterRequestSchema = z.object({
  email: z
    .union([z.email(), z.literal('')])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  phone: z
    .union([
      z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)'),
      z.literal('')
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z
    .union([z.uuid(), z.literal('')])
    .transform((val) => (val === '' ? undefined : val))
    .optional(), // Optional - backend auto-assigns for customers
  role: z.enum(['CUSTOMER', 'SELLER', 'ADMIN', 'STAFF', 'DRIVER']).default('CUSTOMER'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

// Refresh Request
export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'), // JWT token is a string, not UUID
});

// Logout Request
export const LogoutRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'), // JWT token is a string, not UUID
});

// Response Schemas
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(), // seconds
  id: z.string(),
  role: z.array(z.string()),
  tenantId: z.string(),
});

export const RegisterResponseSchema = z.object({
  token: z.string(), // Note: backend returns "token" not "accessToken"
  refreshToken: z.string(),
  id: z.string(),
  role: z.array(z.string()),
  tenantId: z.string(),
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});

// Note: JSDoc type definitions are provided above for IDE autocomplete.
// Zod schemas (below) are the source of truth for runtime validation.