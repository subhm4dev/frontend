import axios from 'axios';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshRequestSchema,
  LogoutRequestSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  RefreshResponseSchema,
  // Catalog
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  ProductSearchRequestSchema,
  ProductSchema,
  ProductListResponseSchema,
  CategoryListResponseSchema,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  CategorySchema,
  // Cart
  AddToCartRequestSchema,
  UpdateCartItemRequestSchema,
  ApplyCouponRequestSchema,
  CartResponseSchema,
  // Order
  CreateOrderRequestSchema,
  UpdateOrderStatusRequestSchema,
  CancelOrderRequestSchema,
  OrderSchema,
  OrderListResponseSchema,
  OrderQuerySchema,
  // Checkout
  CheckoutInitiateRequestSchema,
  CheckoutCompleteRequestSchema,
  CheckoutInitiateResponseSchema,
  CheckoutCompleteResponseSchema,
  // Payment
  ProcessPaymentRequestSchema,
  CreateRazorpayOrderRequestSchema,
  CreateRazorpayOrderResponseSchema,
  RefundPaymentRequestSchema,
  PaymentResponseSchema,
  PaymentMethodListResponseSchema,
  // Profile
  CreateProfileRequestSchema,
  UpdateProfileRequestSchema,
  ProfileSchema,
  // Address
  CreateAddressRequestSchema,
  UpdateAddressRequestSchema,
  AddressSchema,
  AddressListResponseSchema,
} from '@ecom/shared-schemas';

/**
 * API Client for e-commerce backend
 * 
 * Handles:
 * - Base URL configuration (defaults to http://localhost:8080)
 * - JWT token management via token provider (Zustand will provide this)
 * - Automatic token injection in requests
 * - Automatic token refresh on 401
 * - Request/response validation with Zod
 * 
 * Usage with Zustand:
 *script
 * const apiClient = new ApiClient();
 * apiClient.setTokenProvider(() => ({
 *   accessToken: useAuthStore.getState().accessToken,
 *   refreshToken: useAuthStore.getState().refreshToken,
 * }));
 *  */
export class ApiClient {
  constructor(baseURL) {
    // Base URL: use env var, constructor param, or default to localhost:8080
    this.baseURL =
      baseURL ||
      (typeof window !== 'undefined' && window.process?.env?.NEXT_PUBLIC_GATEWAY_URL) ||
      process.env.NEXT_PUBLIC_GATEWAY_URL ||
      'http://localhost:8080';

    // Token provider function (set by Zustand store)
    this.tokenProvider = null;
    
    // User provider function (set by Zustand store) - for getting tenantId, etc.
    this.userProvider = null;
    
    // Token cache (to avoid fetching token on every request)
    this.tokenCache = null;
    this.tokenCacheExpiry = null;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
        withCredentials: true, // Send cookies automatically with requests

    });

    // Request interceptor: Add auth token to headers
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          // Continue without token - will likely fail
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401, refresh token automatically
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token (will use token provider)
            const refreshed = await this.refreshToken();
            if (refreshed) {
              // Retry original request with new token
              const newToken = await this.getAccessToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, dispatch logout event (Zustand will handle)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token Provider Management

  /**
   * Set token provider function (called by Zustand store)
   * @param {() => {accessToken?: string, refreshToken?: string}} provider - Function that returns current tokens
   */
  setTokenProvider(provider) {
    this.tokenProvider = provider;
  }

  /**
   * Get access token from token provider or cookies
   * @returns {Promise<string|null>}
   */
  async getAccessToken() {
    // First, try token provider (if set)
    if (this.tokenProvider) {
      const tokens = this.tokenProvider();
      if (tokens?.accessToken) {
        // Update cache
        this.tokenCache = tokens.accessToken;
        this.tokenCacheExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        return tokens.accessToken;
      }
    }
    
    // Check cache first (avoid fetching on every request)
    if (this.tokenCache && this.tokenCacheExpiry && Date.now() < this.tokenCacheExpiry) {
      return this.tokenCache;
    }
    
    // Fallback: Read from cookies via API route
    // This is necessary because tokens are stored in httpOnly cookies
    // which client-side JavaScript cannot read directly
    try {
      const response = await fetch('/api/auth/token', {
        credentials: 'include', // Include cookies
        cache: 'no-store', // Don't cache this request
      });
      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          // Update cache
          this.tokenCache = data.accessToken;
          this.tokenCacheExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
          return data.accessToken;
        }
      }
    } catch (error) {
      // Failed to get token
    }
    
    // Clear cache if fetch failed
    this.tokenCache = null;
    this.tokenCacheExpiry = null;
    return null;
  }
  
  /**
   * Clear token cache (call this on logout)
   */
  clearTokenCache() {
    this.tokenCache = null;
    this.tokenCacheExpiry = null;
  }

  /**
   * Get refresh token from token provider
   * @returns {string|null}
   */
  getRefreshToken() {
    if (!this.tokenProvider) return null;
    const tokens = this.tokenProvider();
    return tokens?.refreshToken || null;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Get tenant ID for requests
   * Priority: userProvider > default marketplace tenant
   * @returns {string} Tenant ID (default: '00000000-0000-0000-0000-000000000000')
   */
  getTenantId() {
    // If userProvider is set, try to get tenantId from it
    if (this.userProvider) {
      const user = this.userProvider();
      if (user?.tenantId) {
        return user.tenantId;
      }
    }
    
    // Default marketplace tenant ID (for customers and public browsing)
    return '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Set user provider function (similar to tokenProvider)
   * Used to get user info like tenantId
   * @param {Function} provider - Function that returns user object with tenantId
   */
  setUserProvider(provider) {
    this.userProvider = provider;
  }

  // Auth API Methods

  /**
   * Register a new user
   * @param {RegisterRequest} data - Registration data
   * @returns {Promise<RegisterResponse>} - Returns response with tokens (Zustand should store these)
   */
  async register(data) {
    // Validate request with Zod
    const validatedData = RegisterRequestSchema.parse(data);

    const response = await this.client.post('/api/v1/auth/register', validatedData);

    // Backend wraps response in ApiResponse format: { success, data, message, timestamp }
    // Extract the inner 'data' field
    const responseData = response.data?.data || response.data;

    // Validate response with Zod
    const validatedResponse = RegisterResponseSchema.parse(responseData);

    // Return response - Zustand will store tokens
    return validatedResponse;
  }

  /**
   * Login user
   * @param {LoginRequest} data - Login credentials
   * @returns {Promise<LoginResponse>} - Returns response with tokens (Zustand should store these)
   */
  async login(data) {
    // Validate request with Zod
    const validatedData = LoginRequestSchema.parse(data);

    const response = await this.client.post('/api/v1/auth/login', validatedData);

    // Backend wraps response in ApiResponse format: { success, data, message, timestamp }
    // Extract the inner 'data' field
    const responseData = response.data?.data || response.data;

    // Validate response with Zod
    const validatedResponse = LoginResponseSchema.parse(responseData);

    // Return response - Zustand will store tokens
    return validatedResponse;
  }

  /**
   * Refresh access token
   * @param {string} [refreshToken] - Optional refresh token (uses token provider if not provided)
   * @returns {Promise<RefreshResponse>} - Returns new access token (Zustand should update state)
   */
  async refreshToken(refreshToken) {
    const token = refreshToken || this.getRefreshToken();
    if (!token) {
      throw new Error('No refresh token available');
    }

    try {
      // Validate request with Zod
      const validatedData = RefreshRequestSchema.parse({ refreshToken: token });

      const response = await this.client.post('/api/v1/auth/refresh', validatedData);

      // Backend wraps response in ApiResponse format: { success, data, message, timestamp }
      // Extract the inner 'data' field
      const responseData = response.data?.data || response.data;

      // Validate response with Zod
      const validatedResponse = RefreshResponseSchema.parse(responseData);

      // Return response - Zustand will update access token
      return validatedResponse;
    } catch (error) {
      // Refresh failed, dispatch logout event (Zustand will handle)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      throw error;
    }
  }

  /**
 * Logout user
 * @param {string} [refreshToken] - Optional refresh token (if not provided, backend reads from cookies)
 * @returns {Promise<void>}
 */
async logout(refreshToken) {
  try {
    // Always make the API call
    // Cookies are sent automatically by browser:
    // - accessToken cookie → Backend reads for authentication
    // - refreshToken cookie → Backend reads for revoking
    const requestBody = refreshToken 
      ? LogoutRequestSchema.parse({ refreshToken })
      : {}; // Empty body - backend reads refreshToken from cookies
    
    await this.client.post('/api/v1/auth/logout', requestBody);
  } catch (error) {
    // Even if logout fails on server, continue (Zustand will clear state)
  }
}

  /**
   * Logout from all devices
   * @returns {Promise<void>}
   */
  async logoutAll() {
    try {
      await this.client.post('/api/v1/auth/logout-all');
    } catch (error) {
    }
    // Note: Zustand store should clear tokens after calling this
  }

  // Generic API Methods (for future use)

  /**
   * Generic GET request
   * @param {string} url
   * @param {object} [config] - Axios config
   * @returns {Promise<any>}
   */
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   * @param {string} url
   * @param {any} data
   * @param {object} [config] - Axios config
   * @returns {Promise<any>}
   */
  async post(url, data, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   * @param {string} url
   * @param {any} data
   * @param {object} [config] - Axios config
   * @returns {Promise<any>}
   */
  async put(url, data, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   * @param {string} url
   * @param {object} [config] - Axios config
   * @returns {Promise<any>}
   */
  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Export singleton instance (default export)
const apiClient = new ApiClient();

export default apiClient;

// Helper function to extract data from ApiResponse wrapper
function extractData(response) {
  return response.data?.data || response.data;
}

/**
 * Transform backend cart response (snake_case) to frontend schema (camelCase)
 * @param {Object} data - Backend cart response data
 * @returns {Object} - Transformed cart data matching frontend schema
 */
function transformCartResponse(data) {
  if (!data) return null;
  
  return {
    userId: data.user_id || data.userId,
    tenantId: data.tenant_id || data.tenantId,
    items: (data.items || []).map(item => {
      const transformedItem = {
        id: item.item_id || item.id,
        productId: item.product_id || item.productId,
        productName: item.name || item.productName,
        sku: item.sku || '',
        quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || '1'), 10) || 1,
        unitPrice: typeof item.unit_price === 'number' ? item.unit_price : (typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unit_price || item.unitPrice || '0')) || 0),
        totalPrice: typeof item.total_price === 'number' ? item.total_price : (typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(String(item.total_price || item.totalPrice || '0')) || 0),
      };
      
      // Handle variantId - schema allows optional().nullable()
      const variantId = item.variant_id ?? item.variantId;
      if (variantId === null) {
        // Explicitly set to null if backend returned null (schema allows this)
        transformedItem.variantId = null;
      } else if (variantId && typeof variantId === 'string' && variantId.trim() !== '') {
        // Include if it's a valid non-empty string UUID
        transformedItem.variantId = variantId;
      }
      // If undefined or empty string, don't include (optional field)
      
      // Only include image if it's a valid URL (not null/empty)
      const image = item.image_url || item.image;
      if (image && typeof image === 'string' && image.trim() !== '') {
        transformedItem.image = image;
      }
      
      return transformedItem;
    }),
    subtotal: typeof data.subtotal === 'number' ? data.subtotal : parseFloat(String(data.subtotal || '0')) || 0,
    discountAmount: typeof data.discount_amount === 'number' ? data.discount_amount : (typeof data.discountAmount === 'number' ? data.discountAmount : parseFloat(String(data.discount_amount || data.discountAmount || '0')) || 0),
    taxAmount: typeof data.tax_amount === 'number' ? data.tax_amount : (typeof data.taxAmount === 'number' ? data.taxAmount : parseFloat(String(data.tax_amount || data.taxAmount || '0')) || 0),
    shippingCost: typeof data.shipping_cost === 'number' ? data.shipping_cost : (typeof data.shippingCost === 'number' ? data.shippingCost : parseFloat(String(data.shipping_cost || data.shippingCost || '0')) || 0),
    total: typeof data.total === 'number' ? data.total : parseFloat(String(data.total || '0')) || 0,
    currency: data.currency || 'INR',
    couponCode: data.coupon_code || data.couponCode || null,
    // Only include updatedAt if it exists (schema allows optional, not null)
    // Backend returns datetime without timezone, so we need to normalize it
    ...(data.updated_at || data.updatedAt ? { 
      updatedAt: normalizeDatetime(data.updated_at || data.updatedAt) 
    } : {}),
  };
}

/**
 * Normalize datetime string to ISO 8601 format with timezone
 * Backend may return datetime without timezone (e.g., "2025-11-08T18:32:52.40393")
 * Zod requires full ISO 8601 format with timezone
 * @param {string|Date} datetime - Datetime string or Date object
 * @returns {string} - ISO 8601 datetime string with timezone
 */
function normalizeDatetime(datetime) {
  if (!datetime) return undefined;
  
  // If it's already a Date object, convert to ISO string
  if (datetime instanceof Date) {
    return datetime.toISOString();
  }
  
  // If it's a string, check if it has timezone
  if (typeof datetime === 'string') {
    const trimmed = datetime.trim();
    
    // If it already ends with Z or has timezone offset, return as-is
    if (trimmed.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Otherwise, normalize the format manually
    // Backend format: "2025-11-08T18:32:52.40393" (microseconds, no timezone)
    // Convert to: "2025-11-08T18:32:52.403Z" (milliseconds, UTC)
    let normalized = trimmed;
    
    // Check if it has fractional seconds (e.g., ".40393" or ".403")
    // Pattern: YYYY-MM-DDTHH:mm:ss.fff... (where fff can be 1-6 digits)
    const fractionalMatch = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)$/);
    if (fractionalMatch) {
      const basePart = fractionalMatch[1]; // "2025-11-08T18:32:52"
      const fractionalPart = fractionalMatch[2]; // "40393"
      
      // Truncate to 3 decimal places (milliseconds) if more than 3 digits
      if (fractionalPart.length > 3) {
        normalized = basePart + '.' + fractionalPart.substring(0, 3) + 'Z';
      } else {
        // Pad to 3 digits if less than 3, or use as-is if exactly 3
        normalized = basePart + '.' + fractionalPart.padEnd(3, '0') + 'Z';
      }
    } else {
      // No fractional seconds, check if it ends with just seconds (HH:mm:ss)
      const secondsMatch = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/);
      if (secondsMatch) {
        normalized = secondsMatch[1] + '.000Z';
      } else {
        // Fallback: just append Z (shouldn't happen with proper format)
        normalized += 'Z';
      }
    }
    
    return normalized;
  }
  
  return undefined;
}

// Export convenience methods
export const authApi = {
  register: (data) => apiClient.register(data),
  login: (data) => apiClient.login(data),
  logout: (refreshToken) => apiClient.logout(refreshToken),
  logoutAll: () => apiClient.logoutAll(),
  refreshToken: (refreshToken) => apiClient.refreshToken(refreshToken),
  isAuthenticated: () => apiClient.isAuthenticated(),
  setTokenProvider: (provider) => apiClient.setTokenProvider(provider),
};

// Catalog API
export const catalogApi = {
  // Products
  getProducts: async (params = {}) => {
    try {
      const validatedParams = ProductSearchRequestSchema.parse(params);
      // Automatically include tenantId if not provided
      if (!validatedParams.tenantId) {
        validatedParams.tenantId = apiClient.getTenantId();
      }
      const response = await apiClient.client.get('/api/v1/product/search', { params: validatedParams });
      
      const data = extractData(response);
      
      // Transform backend response to match frontend schema
      // Backend returns: { products: [...], page, size, total_elements, total_pages, is_first, is_last }
      // Frontend expects: { content: [...], page, size, totalElements, totalPages, hasNext, hasPrevious }
      const products = data?.products || [];
      const transformedData = {
        content: products.map(product => {
          // Ensure all required fields are present and properly typed
          const transformedProduct = {
            id: product.product_id || product.id, // Backend uses product_id, frontend expects id
            name: product.name || '',
            sku: product.sku || '',
            price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
            currency: product.currency || 'INR',
          };
          
          // Optional fields
          if (product.description !== undefined && product.description !== null) {
            transformedProduct.description = String(product.description);
          }
          // Only set categoryId if it's a valid UUID (not empty string)
          const categoryId = product.category_id || product.categoryId;
          if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
            // Validate UUID format before including
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(categoryId)) {
              transformedProduct.categoryId = categoryId;
            }
          }
          if (Array.isArray(product.images) && product.images.length > 0) {
            transformedProduct.images = product.images;
          }
          if (product.status) {
            transformedProduct.status = product.status;
          }
          // Only set sellerId if it's a valid UUID (not empty string)
          const sellerId = product.seller_id || product.sellerId;
          if (sellerId && typeof sellerId === 'string' && sellerId.trim() !== '') {
            // Validate UUID format before including
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(sellerId)) {
              transformedProduct.sellerId = sellerId;
            }
          }
          // Only set tenantId if it's a valid UUID (not empty string)
          const tenantId = product.tenant_id || product.tenantId;
          if (tenantId && typeof tenantId === 'string' && tenantId.trim() !== '') {
            // Validate UUID format before including
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(tenantId)) {
              transformedProduct.tenantId = tenantId;
            }
          }
          if (product.created_at || product.createdAt) {
            transformedProduct.createdAt = product.created_at || product.createdAt;
          }
          if (product.updated_at || product.updatedAt) {
            transformedProduct.updatedAt = product.updated_at || product.updatedAt;
          }
          
          return transformedProduct;
        }),
        page: typeof data?.page === 'number' ? data.page : (data?.page ? parseInt(String(data.page), 10) : 0),
        size: typeof data?.size === 'number' ? data.size : (data?.size ? parseInt(String(data.size), 10) : 20),
        totalElements: typeof data?.total_elements === 'number' ? data.total_elements : (typeof data?.totalElements === 'number' ? data.totalElements : (data?.total_elements || data?.totalElements ? parseInt(String(data.total_elements || data.totalElements), 10) : 0)),
        totalPages: typeof data?.total_pages === 'number' ? data.total_pages : (typeof data?.totalPages === 'number' ? data.totalPages : (data?.total_pages || data?.totalPages ? parseInt(String(data.total_pages || data.totalPages), 10) : 0)),
        hasNext: data?.is_last === false || (typeof data?.page === 'number' && typeof data?.total_pages === 'number' && data.page < data.total_pages - 1),
        hasPrevious: data?.is_first === false || (typeof data?.page === 'number' && data.page > 0),
      };
      
      return ProductListResponseSchema.parse(transformedData);
    } catch (error) {
      throw error;
    }
  },
  getProduct: async (productId, options = {}) => {
    try {
      // Automatically include tenantId if not provided
      const tenantId = options.tenantId || apiClient.getTenantId();
      const response = await apiClient.client.get(`/api/v1/product/${productId}`, { 
        params: { tenantId } 
      });
      
      const data = extractData(response);
      
      // Transform backend response to match frontend schema
      // Backend returns: { product_id, category_id, seller_id, created_at, updated_at }
      // Frontend expects: { id, categoryId, sellerId, createdAt, updatedAt }
      const transformedData = {
        id: data.product_id || data.id,
        name: data.name || '',
        sku: data.sku || '',
        price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
        currency: data.currency || 'INR',
      };
      
      // Optional fields
      if (data.description !== undefined && data.description !== null) {
        transformedData.description = String(data.description);
      }
      
      // Only set categoryId if it's a valid UUID (not empty string)
      const categoryId = data.category_id || data.categoryId;
      if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(categoryId)) {
          transformedData.categoryId = categoryId;
        }
      }
      
      if (Array.isArray(data.images) && data.images.length > 0) {
        transformedData.images = data.images;
      }
      
      if (data.status) {
        transformedData.status = data.status;
      }
      
      // Only set sellerId if it's a valid UUID (not empty string)
      const sellerId = data.seller_id || data.sellerId;
      if (sellerId && typeof sellerId === 'string' && sellerId.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(sellerId)) {
          transformedData.sellerId = sellerId;
        }
      }
      
      // Only set tenantId if it's a valid UUID (not empty string)
      const tenantIdValue = data.tenant_id || data.tenantId;
      if (tenantIdValue && typeof tenantIdValue === 'string' && tenantIdValue.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(tenantIdValue)) {
          transformedData.tenantId = tenantIdValue;
        }
      }
      
      if (data.created_at || data.createdAt) {
        transformedData.createdAt = data.created_at || data.createdAt;
      }
      
      if (data.updated_at || data.updatedAt) {
        transformedData.updatedAt = data.updated_at || data.updatedAt;
      }
      
      return ProductSchema.parse(transformedData);
    } catch (error) {
      throw error;
    }
  },
  createProduct: async (data) => {
    const validatedData = CreateProductRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/product', validatedData);
    const responseData = extractData(response);
    return ProductSchema.parse(responseData);
  },
  updateProduct: async (productId, data) => {
    const validatedData = UpdateProductRequestSchema.parse(data);
    const response = await apiClient.client.put(`/api/v1/product/${productId}`, validatedData);
    const responseData = extractData(response);
    return ProductSchema.parse(responseData);
  },
  deleteProduct: async (productId) => {
    await apiClient.client.delete(`/api/v1/product/${productId}`);
  },
  // Categories
  getCategories: async (options = {}) => {
    // Automatically include tenantId if not provided
    const tenantId = options.tenantId || apiClient.getTenantId();
    const response = await apiClient.client.get('/api/v1/category', { 
      params: { tenantId } 
    });
    const data = extractData(response);
    return CategoryListResponseSchema.parse(data);
  },
  getCategory: async (categoryId, options = {}) => {
    // Automatically include tenantId if not provided
    const tenantId = options.tenantId || apiClient.getTenantId();
    const response = await apiClient.client.get(`/api/v1/category/${categoryId}`, { 
      params: { tenantId } 
    });
    const data = extractData(response);
    return CategorySchema.parse(data);
  },
  createCategory: async (data) => {
    const validatedData = CreateCategoryRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/category', validatedData);
    const responseData = extractData(response);
    return CategorySchema.parse(responseData);
  },
  updateCategory: async (categoryId, data) => {
    const validatedData = UpdateCategoryRequestSchema.parse(data);
    const response = await apiClient.client.put(`/api/v1/category/${categoryId}`, validatedData);
    const responseData = extractData(response);
    return CategorySchema.parse(responseData);
  },
  deleteCategory: async (categoryId) => {
    await apiClient.client.delete(`/api/v1/category/${categoryId}`);
  },
};

// Cart API
export const cartApi = {
  getCart: async () => {
    try {
      const response = await apiClient.client.get('/api/v1/cart');
      const data = extractData(response);
      const transformedData = transformCartResponse(data);
      const validated = CartResponseSchema.parse(transformedData);
      return validated;
    } catch (error) {
      throw error;
    }
  },
  addItem: async (data) => {
    const validatedData = AddToCartRequestSchema.parse(data);
    // Transform camelCase to snake_case for backend compatibility
    const requestBody = {
      product_id: validatedData.productId,
      quantity: validatedData.quantity,
    };
    if (validatedData.variantId) {
      requestBody.variant_id = validatedData.variantId;
    }
    const response = await apiClient.client.post('/api/v1/cart/item', requestBody);
    const responseData = extractData(response);
    const transformedData = transformCartResponse(responseData);
    return CartResponseSchema.parse(transformedData);
  },
  updateItem: async (itemId, data) => {
    const validatedData = UpdateCartItemRequestSchema.parse(data);
    const response = await apiClient.client.put(`/api/v1/cart/item/${itemId}`, validatedData);
    const responseData = extractData(response);
    const transformedData = transformCartResponse(responseData);
    return CartResponseSchema.parse(transformedData);
  },
  removeItem: async (itemId) => {
    const response = await apiClient.client.delete(`/api/v1/cart/item/${itemId}`);
    const responseData = extractData(response);
    const transformedData = transformCartResponse(responseData);
    return CartResponseSchema.parse(transformedData);
  },
  clearCart: async () => {
    await apiClient.client.delete('/api/v1/cart');
  },
  applyCoupon: async (data) => {
    const validatedData = ApplyCouponRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/cart/coupon', validatedData);
    const responseData = extractData(response);
    const transformedData = transformCartResponse(responseData);
    return CartResponseSchema.parse(transformedData);
  },
  removeCoupon: async () => {
    const response = await apiClient.client.delete('/api/v1/cart/coupon');
    const responseData = extractData(response);
    const transformedData = transformCartResponse(responseData);
    return CartResponseSchema.parse(transformedData);
  },
};


/**
 * Transform backend order summary (for list items) - snake_case to camelCase
 * @param {Object} order - Backend order summary object
 * @returns {Object} - Transformed order summary matching frontend schema
 */
function transformOrderSummary(order) {
  if (!order) return null;
  
  return {
    id: order.id,
    orderNumber: order.order_number || order.orderNumber || 'ORD-PENDING',
    status: order.status || 'PLACED',
    paymentId: order.payment_id || order.paymentId,
    total: typeof order.total === 'number' ? order.total : parseFloat(String(order.total || '0')) || 0,
    currency: order.currency || 'INR',
    itemCount: typeof order.item_count === 'number' ? order.item_count : parseInt(String(order.item_count || '0'), 10),
    createdAt: normalizeDatetime(order.created_at || order.createdAt) || new Date().toISOString(),
  };
}

/**
 * Transform backend order response (snake_case) to frontend schema (camelCase)
 * For full order details (not list items)
 * @param {Object} order - Backend order object
 * @returns {Object} - Transformed order matching frontend schema
 */
function transformOrderResponse(order) {
  if (!order) return null;
  
  // Generate a valid UUID placeholder for missing required UUID fields
  const generatePlaceholderUUID = (value) => {
    if (value) return value;
    // Return a valid UUID format (all zeros) as placeholder for missing fields
    return '00000000-0000-0000-0000-000000000000';
  };
  
  return {
    id: order.id,
    orderNumber: order.order_number || order.orderNumber || 'ORD-PENDING',
    userId: generatePlaceholderUUID(order.user_id || order.userId),
    tenantId: generatePlaceholderUUID(order.tenant_id || order.tenantId),
    items: (order.items || []).map(item => ({
      id: item.id || generatePlaceholderUUID(),
      productId: item.product_id || item.productId || generatePlaceholderUUID(),
      sku: item.sku || '',
      productName: item.product_name || item.productName || '',
      quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || '0'), 10),
      unitPrice: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(String(item.unit_price || '0')) || 0,
      totalPrice: typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price || '0')) || 0,
      variantId: item.variant_id || item.variantId || null,
    })),
    shippingAddressId: generatePlaceholderUUID(order.shipping_address_id || order.shippingAddressId),
    paymentId: generatePlaceholderUUID(order.payment_id || order.paymentId),
    status: order.status || 'PLACED',
    subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(String(order.subtotal || order.total || '0')) || 0,
    discountAmount: typeof order.discount_amount === 'number' ? order.discount_amount : parseFloat(String(order.discount_amount || '0')) || 0,
    taxAmount: typeof order.tax_amount === 'number' ? order.tax_amount : parseFloat(String(order.tax_amount || '0')) || 0,
    shippingCost: typeof order.shipping_cost === 'number' ? order.shipping_cost : parseFloat(String(order.shipping_cost || '0')) || 0,
    total: typeof order.total === 'number' ? order.total : parseFloat(String(order.total || '0')) || 0,
    currency: order.currency || 'INR',
    notes: order.notes || null,
    trackingNumber: order.tracking_number || order.trackingNumber || null,
    shippedAt: order.shipped_at || order.shippedAt ? normalizeDatetime(order.shipped_at || order.shippedAt) : null,
    deliveredAt: order.delivered_at || order.deliveredAt ? normalizeDatetime(order.delivered_at || order.deliveredAt) : null,
    createdAt: normalizeDatetime(order.created_at || order.createdAt) || new Date().toISOString(),
    updatedAt: order.updated_at || order.updatedAt 
      ? normalizeDatetime(order.updated_at || order.updatedAt) 
      : normalizeDatetime(order.created_at || order.createdAt) || new Date().toISOString(),
  };
}

/**
 * Transform Spring Data Page response to frontend pagination format
 * Uses OrderSummary transformation for list items (simplified orders)
 * @param {Object} data - Spring Data Page response
 * @returns {Object} - Transformed pagination data
 */
function transformOrderListResponse(data) {
  if (!data) return null;
  
  return {
    content: (data.content || []).map(order => transformOrderSummary(order)), // Use summary transform for list items
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 0,
    page: data.number !== undefined ? data.number : data.page || 0,
    size: data.size || 0,
    hasNext: data.last !== undefined ? !data.last : data.hasNext || false,
    hasPrevious: data.first !== undefined ? !data.first : data.hasPrevious || false,
  };
}

// Order API
export const orderApi = {
  getOrders: async (params = {}) => {
    let transformedData = null;
    try {
      const validatedParams = OrderQuerySchema.parse(params);
      const response = await apiClient.client.get('/api/v1/order', { params: validatedParams });
      const data = extractData(response);
      
      transformedData = transformOrderListResponse(data);
      
      return OrderListResponseSchema.parse(transformedData);
    } catch (error) {
      throw error;
    }
  },
  getOrder: async (orderId) => {
    try {
      const response = await apiClient.client.get(`/api/v1/order/${orderId}`);
      const data = extractData(response);
      const transformedData = transformOrderResponse(data);
      return OrderSchema.parse(transformedData);
    } catch (error) {
      throw error;
    }
  },
  createOrder: async (data) => {
    const validatedData = CreateOrderRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/order', validatedData);
    const responseData = extractData(response);
    const transformedData = transformOrderResponse(responseData);
    return OrderSchema.parse(transformedData);
  },
  updateOrderStatus: async (orderId, data) => {
    const validatedData = UpdateOrderStatusRequestSchema.parse(data);
    const response = await apiClient.client.put(`/api/v1/order/${orderId}/status`, validatedData);
    const responseData = extractData(response);
    const transformedData = transformOrderResponse(responseData);
    return OrderSchema.parse(transformedData);
  },
  cancelOrder: async (orderId, data) => {
    const validatedData = CancelOrderRequestSchema.parse(data);
    const response = await apiClient.client.post(`/api/v1/order/${orderId}/cancel`, validatedData);
    const responseData = extractData(response);
    const transformedData = transformOrderResponse(responseData);
    return OrderSchema.parse(transformedData);
  },
};

/**
 * Transform backend checkout response (snake_case) to frontend schema (camelCase)
 * @param {Object} data - Backend checkout response data
 * @returns {Object} - Transformed checkout data matching frontend schema
 */
function transformCheckoutResponse(data) {
  if (!data) return null;
  
  return {
    items: (data.items || []).map(item => ({
      productId: item.product_id || item.productId,
      sku: item.sku || '',
      productName: item.name || item.productName,
      quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || '1'), 10) || 1,
      unitPrice: typeof item.unit_price === 'number' ? item.unit_price : (typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unit_price || item.unitPrice || '0')) || 0),
      totalPrice: typeof item.total_price === 'number' ? item.total_price : (typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(String(item.total_price || item.totalPrice || '0')) || 0),
    })),
    subtotal: typeof data.subtotal === 'number' ? data.subtotal : parseFloat(String(data.subtotal || '0')) || 0,
    discountAmount: typeof data.discount_amount === 'number' ? data.discount_amount : (typeof data.discountAmount === 'number' ? data.discountAmount : parseFloat(String(data.discount_amount || data.discountAmount || '0')) || 0),
    taxAmount: typeof data.tax_amount === 'number' ? data.tax_amount : (typeof data.taxAmount === 'number' ? data.taxAmount : parseFloat(String(data.tax_amount || data.taxAmount || '0')) || 0),
    shippingCost: typeof data.shipping_cost === 'number' ? data.shipping_cost : (typeof data.shippingCost === 'number' ? data.shippingCost : parseFloat(String(data.shipping_cost || data.shippingCost || '0')) || 0),
    total: typeof data.total === 'number' ? data.total : parseFloat(String(data.total || '0')) || 0,
    currency: data.currency || 'INR',
    isValid: data.is_valid !== undefined ? data.is_valid : (data.isValid !== undefined ? data.isValid : true),
    warnings: data.warnings || [],
  };
}

// Checkout API
export const checkoutApi = {
  initiateCheckout: async (data) => {
    const validatedData = CheckoutInitiateRequestSchema.parse(data);
    // Transform camelCase to snake_case for backend compatibility
    const requestBody = {
      shipping_address_id: validatedData.shippingAddressId,
    };
    if (validatedData.paymentMethodId) {
      requestBody.payment_method_id = validatedData.paymentMethodId;
    }
    if (validatedData.cartId) {
      requestBody.cart_id = validatedData.cartId;
    }
    const response = await apiClient.client.post('/api/v1/checkout/initiate', requestBody);
    const responseData = extractData(response);
    // Transform backend response to match frontend schema
    const transformedData = transformCheckoutResponse(responseData);
    return CheckoutInitiateResponseSchema.parse(transformedData);
  },
  completeCheckout: async (data) => {
    const validatedData = CheckoutCompleteRequestSchema.parse(data);
    // Transform camelCase to snake_case for backend compatibility
    const requestBody = {
      shipping_address_id: validatedData.shippingAddressId,
    };
    if (validatedData.paymentMethodId) {
      requestBody.payment_method_id = validatedData.paymentMethodId;
    }
    if (validatedData.paymentGatewayTransactionId) {
      requestBody.payment_gateway_transaction_id = validatedData.paymentGatewayTransactionId;
    }
    if (validatedData.cartId) {
      requestBody.cart_id = validatedData.cartId;
    }
    const response = await apiClient.client.post('/api/v1/checkout/complete', requestBody);
    const responseData = extractData(response);
    // Transform backend response to match frontend schema
    const transformedData = {
      orderId: responseData.order_id || responseData.orderId,
      orderNumber: responseData.order_number || responseData.orderNumber,
      paymentId: responseData.payment_id || responseData.paymentId,
      total: typeof responseData.total === 'number' ? responseData.total : parseFloat(String(responseData.total || '0')) || 0,
      currency: responseData.currency || 'INR',
    };
    return CheckoutCompleteResponseSchema.parse(transformedData);
  },
};

// Payment API
export const paymentApi = {
  createOrder: async (data) => {
    const validatedData = CreateRazorpayOrderRequestSchema.parse(data);
    // Transform camelCase to snake_case for backend compatibility
    const requestBody = {
      order_id: validatedData.orderId,
      amount: validatedData.amount,
      currency: validatedData.currency || 'INR',
      payment_method_type: validatedData.paymentMethodType,
    };
    const response = await apiClient.client.post('/api/v1/payment/order/create', requestBody);
    const responseData = extractData(response);
    // Transform backend response to match frontend schema
    const transformedData = {
      orderId: responseData.order_id || responseData.orderId,
      razorpayOrderId: responseData.razorpay_order_id || responseData.razorpayOrderId,
      amount: typeof responseData.amount === 'number' ? responseData.amount : parseFloat(String(responseData.amount || '0')) || 0,
      currency: responseData.currency || 'INR',
      status: responseData.status || 'CREATED',
    };
    return CreateRazorpayOrderResponseSchema.parse(transformedData);
  },
  processPayment: async (data) => {
    const validatedData = ProcessPaymentRequestSchema.parse(data);
    // Transform camelCase to snake_case for backend compatibility
    const requestBody = {
      order_id: validatedData.orderId,
      amount: validatedData.amount,
      currency: validatedData.currency || 'INR',
    };
    if (validatedData.paymentMethodId) {
      requestBody.payment_method_id = validatedData.paymentMethodId;
    }
    if (validatedData.paymentMethod) {
      requestBody.payment_method = validatedData.paymentMethod;
    }
    if (validatedData.phoneNumber) {
      requestBody.phone_number = validatedData.phoneNumber;
    }
    if (validatedData.paymentGatewayTransactionId) {
      requestBody.payment_gateway_transaction_id = validatedData.paymentGatewayTransactionId;
    }
    const response = await apiClient.client.post('/api/v1/payment/process', requestBody);
    const responseData = extractData(response);
    
    // Transform backend response from snake_case to camelCase
    // Helper to format datetime string to ISO format
    const formatDateTime = (dateStr) => {
      if (!dateStr) return undefined;
      if (dateStr instanceof Date) return dateStr.toISOString();
      if (typeof dateStr === 'string') {
        // If already in ISO format with Z, return as is
        if (dateStr.endsWith('Z')) return dateStr;
        // If has timezone offset, return as is
        if (dateStr.match(/[+-]\d{2}:\d{2}$/)) return dateStr;
        // Otherwise, add Z to make it UTC
        return dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
      }
      return undefined;
    };
    
    const transformedData = {
      paymentId: responseData.id || responseData.paymentId,
      orderId: responseData.order_id || responseData.orderId,
      status: responseData.status || 'PENDING',
      amount: typeof responseData.amount === 'number' ? responseData.amount : parseFloat(String(responseData.amount || '0')) || 0,
      currency: responseData.currency || 'INR',
      transactionId: responseData.gateway_transaction_id || responseData.gateway_payment_id || responseData.transactionId,
      paymentLink: responseData.payment_link || responseData.paymentLink,
      qrCode: responseData.qr_code || responseData.qrCode,
      errorMessage: responseData.failure_reason || responseData.errorMessage,
      createdAt: formatDateTime(responseData.created_at || responseData.processed_at || responseData.createdAt) || new Date().toISOString(),
    };
    
    return PaymentResponseSchema.parse(transformedData);
  },
  getPaymentMethods: async () => {
    const response = await apiClient.client.get('/api/v1/payment/method');
    const data = extractData(response);
    return PaymentMethodListResponseSchema.parse(data);
  },
  tokenizePaymentMethod: async (data) => {
    // This endpoint may vary - adjust based on backend implementation
    const response = await apiClient.client.post('/api/v1/payment/method/tokenize', data);
    const responseData = extractData(response);
    return PaymentMethodListResponseSchema.parse(responseData);
  },
  refundPayment: async (data) => {
    const validatedData = RefundPaymentRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/payment/refund', validatedData);
    const responseData = extractData(response);
    return PaymentResponseSchema.parse(responseData);
  },
};

// Profile API
export const profileApi = {
  getProfile: async (userId = 'me') => {
    const url = userId === 'me' ? '/api/v1/profile/me' : `/api/v1/profile/${userId}`;
    const response = await apiClient.client.get(url);
    const data = extractData(response);
    return ProfileSchema.parse(data);
  },
  createOrUpdateProfile: async (data) => {
    const validatedData = CreateProfileRequestSchema.parse(data);
    const response = await apiClient.client.post('/api/v1/profile', validatedData);
    const responseData = extractData(response);
    return ProfileSchema.parse(responseData);
  },
  updateProfile: async (data) => {
    const validatedData = UpdateProfileRequestSchema.parse(data);
    const response = await apiClient.client.put('/api/v1/profile', validatedData);
    const responseData = extractData(response);
    return ProfileSchema.parse(responseData);
  },
};

/**
 * Transform backend address response to frontend schema
 * Backend uses: line1, line2, postcode, label
 * Frontend expects: street, street2, postalCode, type, fullName, phone
 */
function transformAddressResponse(data) {
  if (!data) return null;
  
  // Map label to type enum
  const labelToType = (label) => {
    if (!label) return 'HOME';
    const upperLabel = label.toUpperCase();
    if (upperLabel === 'HOME' || upperLabel === 'WORK' || upperLabel === 'OTHER') {
      return upperLabel;
    }
    // Try to infer from common labels
    if (upperLabel.includes('HOME') || upperLabel.includes('HOUSE') || upperLabel.includes('RESIDENCE')) {
      return 'HOME';
    }
    if (upperLabel.includes('WORK') || upperLabel.includes('OFFICE') || upperLabel.includes('BUSINESS')) {
      return 'WORK';
    }
    return 'OTHER';
  };
  
  return {
    id: data.id,
    userId: data.user_id || data.userId,
    tenantId: data.tenant_id || data.tenantId,
    fullName: data.fullName || data.full_name || null, // May not exist in backend
    phone: data.phone && typeof data.phone === 'string' && data.phone.trim() !== '' ? data.phone : null, // Only include if valid string
    street: data.line1 || data.street || '',
    street2: data.line2 || data.street2 || null,
    city: data.city || '',
    state: data.state || '',
    postalCode: data.postcode || data.postalCode || data.postal_code || '',
    country: data.country || 'IN',
    type: labelToType(data.label || data.type),
    isDefault: data.isDefault !== undefined ? data.isDefault : (data.is_default !== undefined ? data.is_default : false),
    // Normalize datetime fields (only include if they exist, schema allows optional)
    ...(data.createdAt || data.created_at ? { createdAt: normalizeDatetime(data.createdAt || data.created_at) } : {}),
    ...(data.updatedAt || data.updated_at ? { updatedAt: normalizeDatetime(data.updatedAt || data.updated_at) } : {}),
  };
}

// Address API
export const addressApi = {
  getAddresses: async (userId) => {
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient.client.get('/api/v1/address', { params });
      const data = extractData(response);
      // Transform array of addresses
      const addresses = Array.isArray(data) ? data : [];
      const transformedAddresses = addresses.map(addr => {
        const transformed = transformAddressResponse(addr);
        return transformed;
      });
      
      const validated = AddressListResponseSchema.parse(transformedAddresses);
      return validated;
    } catch (error) {
      throw error;
    }
  },
  getAddress: async (addressId) => {
    const response = await apiClient.client.get(`/api/v1/address/${addressId}`);
    const data = extractData(response);
    const transformedData = transformAddressResponse(data);
    return AddressSchema.parse(transformedData);
  },
  createAddress: async (data) => {
    const validatedData = CreateAddressRequestSchema.parse(data);
    
    // Transform frontend schema to backend format for request
    const requestBody = {
      line1: validatedData.street,
      line2: validatedData.street2 || null,
      city: validatedData.city,
      state: validatedData.state,
      postcode: validatedData.postalCode,
      country: validatedData.country,
      label: validatedData.type || 'HOME', // Map type enum to label string
      isDefault: validatedData.isDefault || false,
    };
    
    // Include optional fields if provided
    if (validatedData.fullName) {
      requestBody.fullName = validatedData.fullName;
    }
    if (validatedData.phone) {
      requestBody.phone = validatedData.phone;
    }
    
    const response = await apiClient.client.post('/api/v1/address', requestBody);
    const responseData = extractData(response);
    const transformedData = transformAddressResponse(responseData);
    return AddressSchema.parse(transformedData);
  },
  updateAddress: async (addressId, data) => {
    const validatedData = UpdateAddressRequestSchema.parse(data);
    
    // Transform frontend schema to backend format for request
    const requestBody = {};
    if (validatedData.street !== undefined) requestBody.line1 = validatedData.street;
    if (validatedData.street2 !== undefined) requestBody.line2 = validatedData.street2 || null;
    if (validatedData.city !== undefined) requestBody.city = validatedData.city;
    if (validatedData.state !== undefined) requestBody.state = validatedData.state;
    if (validatedData.postalCode !== undefined) requestBody.postcode = validatedData.postalCode;
    if (validatedData.country !== undefined) requestBody.country = validatedData.country;
    if (validatedData.type !== undefined) requestBody.label = validatedData.type; // Map type enum to label string
    if (validatedData.isDefault !== undefined) requestBody.isDefault = validatedData.isDefault;
    if (validatedData.fullName !== undefined) requestBody.fullName = validatedData.fullName;
    if (validatedData.phone !== undefined) requestBody.phone = validatedData.phone;
    
    const response = await apiClient.client.put(`/api/v1/address/${addressId}`, requestBody);
    const responseData = extractData(response);
    const transformedData = transformAddressResponse(responseData);
    return AddressSchema.parse(transformedData);
  },
  deleteAddress: async (addressId) => {
    await apiClient.client.delete(`/api/v1/address/${addressId}`);
  },
};

// Export the class for custom instances
export { ApiClient };