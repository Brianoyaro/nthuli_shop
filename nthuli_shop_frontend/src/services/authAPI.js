import apiClient from './api';

export const authAPI = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} firstName - User first name
   * @param {string} lastName - User last name
   * @returns {Object} User and tokens
   */
  register: async (email, password, firstName, lastName) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User and tokens
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New tokens
   */
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },
};

export default authAPI;
