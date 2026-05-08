import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Auth API Service
 * Handles user authentication without Authorization header
 * (uses regular axios instance to avoid auth interceptor loops)
 */

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response logging
authClient.interceptors.response.use(
  response => {
    console.log(`🟢 Auth Response: ${response.status}`, response.data);
    return response;
  },
  error => {
    console.error('❌ Auth Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration response
   */
  register: async (email, password) => {
    try {
      console.log('📝 Registering user:', email);
      const response = await authClient.post('/auth/register', {
        email,
        password,
        role: 'USER',
      });

      console.log('✅ Registration successful');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed';

      console.error('❌ Registration error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with tokens
   */
  login: async (email, password) => {
    try {
      console.log('🔓 Logging in user:', email);
      const response = await authClient.post('/auth/login', {
        email,
        password,
      });

      console.log('✅ Login successful');
      console.log('📦 Token response:', {
        accessToken: response.data.accessToken ? '***' : 'missing',
        refreshToken: response.data.refreshToken ? '***' : 'missing',
        tokenType: response.data.tokenType,
        expiresIn: response.data.expiresIn,
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed';

      console.error('❌ Login error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Refresh access token
   * @param {string} token - Refresh token
   * @returns {Promise<Object>} New token response
   */
  refreshToken: async (token) => {
    try {
      console.log('🔄 Refreshing token');
      const response = await authClient.post('/auth/refresh-token', {
        token,
      });

      console.log('✅ Token refresh successful');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Token refresh failed';

      console.error('❌ Token refresh error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Check auth service health
   * @returns {Promise<Object>} Health status
   */
  health: async () => {
    try {
      console.log('❤️ Checking auth service health');
      const response = await authClient.get('/auth/health');
      console.log('✅ Auth service is healthy:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw new Error('Auth service is unavailable');
    }
  },
};
