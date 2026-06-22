import apiClient from './api';

/**
 * Payments API Service
 * Handles M-Pesa payment initiation, status checking, and related operations
 */

export const paymentsAPI = {

  /**
   * Initiate M-Pesa STK Push payment
   * @param {Object} paymentData - Payment data object
   * @param {string} paymentData.phoneNumber - Customer phone number in format 254XXXXXXXXX
   * @param {number} paymentData.amount - Amount to charge (must be > 0)
   * @param {string} paymentData.orderId - Order ID for reference (required)
   * @param {string} paymentData.description - Payment description (optional)
   * @returns {Promise<Object>} Payment response with paymentId, responseCode, customerMessage
   */
  initiateM2uPayment: async (phoneNumber, amount, orderId, description = '') => {
    try {
      const response = await apiClient.post('/payments/mpesa/stk-push', {
        phoneNumber,
        amount,
        orderId,
        description: description || `Order #${orderId}`,
      });
      // Backend returns { data: MpesaStkPushResponse, success, message }
      // The actual payment response is in response.data.data if wrapped, or response.data if not
      const paymentData = response.data.data || response.data;
      console.log('📱 M-Pesa STK Push response:', paymentData);
      return paymentData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to initiate M-Pesa payment'
      );
    }
  },

  /**
   * Check payment status by checkoutRequestId
   * @param {string|number} checkoutRequestId - CheckoutRequestId from M-Pesa STK Push response
   * @returns {Promise<Object>} Payment status with paymentStatus field (PENDING, COMPLETED, FAILED, CANCELLED)
   */
  getPaymentStatus: async (checkoutRequestId) => {
    try {
      const response = await apiClient.get(`/payments/status/${checkoutRequestId}`);
      // Backend wraps response in { data: {...}, success, message }
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to check payment status'
      );
    }
  },

  /**
   * Get payment details by ID
   * @param {string|number} paymentId - Payment ID
   * @returns {Promise<Object>} Full payment details
   */
  getPayment: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch payment'
      );
    }
  },

  /**
   * Get payment by order ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Payment details associated with order
   */
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await apiClient.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch payment for order'
      );
    }
  },

  /**
   * Retry M-Pesa payment for an existing order
   * @param {string|number} orderId - Order ID to retry payment for
   * @param {string} phoneNumber - Customer phone number in format 254XXXXXXXXX
   * @returns {Promise<Object>} Payment response with new paymentId
   */
  retryPayment: async (orderId, phoneNumber) => {
    try {
      const response = await apiClient.post(`/payments/mpesa/stk-push/retry/${orderId}`, {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to retry payment'
      );
    }
  },

  /**
   * Cancel a pending payment
   * @param {string|number} paymentId - Payment ID to cancel
   * @returns {Promise<Object>} Cancellation response
   */
  cancelPayment: async (paymentId) => {
    try {
      const response = await apiClient.put(`/payments/${paymentId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cancel payment'
      );
    }
  },

  /**
   * Get payment history for a customer by email
   * @param {string} email - Customer email
   * @returns {Promise<Array>} Array of payment records
   */
  getPaymentHistory: async (email) => {
    try {
      const response = await apiClient.get(`/payments/email/${email}/history`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch payment history'
      );
    }
  },

  /**
   * Initiate a Paystack transaction via the backend.
   * Backend is expected to return an authorization URL and reference.
   * @param {string|number} orderId - Order ID to attach to the payment
   * @param {string} email - Customer email required by Paystack
   * @returns {Promise<Object>} Initialization data (authorization URL, reference, etc.)
   */
  initPaystackTransaction: async (orderId, email) => {
    try {
      const response = await apiClient.post('/payments', {
        orderId,
        email,
        paymentMethod: 'PAYSTACK',
      });

      const data = response.data.data || response.data;
      console.log('💳 Paystack init response:', data);
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to initiate Paystack transaction'
      );
    }
  },

  /**
   * Verify a Paystack transaction by reference via backend.
   * @param {string} reference - Paystack transaction reference
   * @returns {Promise<Object>} Verification result
   */
  verifyPaystackTransaction: async (reference) => {
    try {
      const response = await apiClient.get(`/payments/verify/${reference}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to verify Paystack transaction'
      );
    }
  },
};
