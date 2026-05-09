import apiClient from './api';

/**
 * Profile API Service
 * Handles user profile-related API calls
 * All endpoints require authentication
 */

export const profileAPI = {
  /**
   * Get the authenticated user's profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update the authenticated user's profile
   * @param {Object} data - Updated profile fields (email, currentPassword, newPassword)
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/user/profile', data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/user/profile/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to change password';
      throw new Error(errorMessage);
    }
  },
};
