import apiClient from './api';

export const paymentsAPI = {
  /**
   * Initiate M-Pesa payment
   * @param {string} phoneNumber - Customer's M-Pesa phone number (e.g., 254712345678)
   * @param {number} amount - Amount to charge in KES
   * @param {string} description - Optional payment description
   * @returns {Object} Payment response with paymentId, checkoutRequestId, etc.
   */
  initiateM2uPayment: async (phoneNumber, amount, description = '') => {
    const response = await apiClient.post('/payments/initiate-m2u', {
      phoneNumber,
      amount,
      description,
    });
    return response.data;
  },

  /**
   * Query payment status
   * @param {string} paymentId - Payment ID to check status for
   * @returns {Object} Payment status response
   */
  getPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  /**
   * Get payment details
   * @param {string} paymentId - Payment ID
   * @returns {Object} Payment details
   */
  getPayment: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Cancel a payment
   * @param {string} paymentId - Payment ID to cancel
   * @param {string} reason - Cancellation reason
   * @returns {Object} Cancellation response
   */
  cancelPayment: async (paymentId, reason = '') => {
    const response = await apiClient.post(`/payments/${paymentId}/cancel`, {
      reason,
    });
    return response.data;
  },
};

export default paymentsAPI;
