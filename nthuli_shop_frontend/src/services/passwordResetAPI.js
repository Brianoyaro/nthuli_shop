import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance without interceptors for password reset (auth not needed)
const passwordResetAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const passwordResetAPI = {
  // Request password reset token
  forgotPassword: async (email) => {
    try {
      const response = await passwordResetAxios.post('/auth/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validate reset token
  validateResetToken: async (token) => {
    try {
      const response = await passwordResetAxios.get(`/auth/reset-password/validate/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await passwordResetAxios.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default passwordResetAPI;
