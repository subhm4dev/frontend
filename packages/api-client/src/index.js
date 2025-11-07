import axios from 'axios';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshRequestSchema,
  LogoutRequestSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  RefreshResponseSchema,
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

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor: Add auth token to headers
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
              const newToken = this.getAccessToken();
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
   * Get access token from token provider
   * @returns {string|null}
   */
  getAccessToken() {
    if (!this.tokenProvider) return null;
    const tokens = this.tokenProvider();
    return tokens?.accessToken || null;
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
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAccessToken();
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
   * @param {string} [refreshToken] - Optional refresh token (uses token provider if not provided)
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    const token = refreshToken || this.getRefreshToken();

    try {
      if (token) {
        // Validate request with Zod
        const validatedData = LogoutRequestSchema.parse({ refreshToken: token });
        await this.client.post('/api/v1/auth/logout', validatedData);
      }
    } catch (error) {
      // Even if logout fails on server, continue (Zustand will clear tokens)
      console.error('Logout error:', error);
    }
    // Note: Zustand store should clear tokens after calling this
  }

  /**
   * Logout from all devices
   * @returns {Promise<void>}
   */
  async logoutAll() {
    try {
      await this.client.post('/api/v1/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
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

// Export the class for custom instances
export { ApiClient };