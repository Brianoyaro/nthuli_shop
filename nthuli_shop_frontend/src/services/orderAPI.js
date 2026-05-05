import apiClient from './api';

/**
 * Order API Service
 * Handles all order-related API calls to the backend
 * All endpoints require authentication
 */

export const orderAPI = {
  /**
   * Create order from authenticated user's cart
   * @param {Object} orderData - Order data object
   * @param {string} orderData.shippingAddress - Delivery address (required)
   * @param {string} orderData.notes - Order notes (optional)
   * @param {string} orderData.description - Order description (optional)
   * @returns {Promise<Object>} Order response with id, totalAmount, orderItems, etc.
   */
  createOrderFromCart: async (orderData) => {
    try {
      console.log('📤 Creating order from cart:', orderData);
      const response = await apiClient.post('/orders/from-cart', orderData);
      console.log('✅ Order created from cart:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create order from cart';

      console.error('❌ Order creation error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get order by ID (must be owner or admin)
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrder: async (orderId) => {
    try {
      console.log('📦 Fetching order:', orderId);
      const response = await apiClient.get(`/orders/${orderId}`);
      console.log('✅ Order fetched:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch order';

      console.error('❌ Get order error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all orders for authenticated user
   * @returns {Promise<Array>} Array of user's orders
   */
  getUserOrders: async () => {
    try {
      console.log('📋 Fetching user orders');
      const response = await apiClient.get('/orders/user/all');
      console.log('✅ User orders fetched:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user orders';

      console.error('❌ Get user orders error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get completed orders for authenticated user
   * @returns {Promise<Array>} Array of completed orders
   */
  getCompletedOrders: async () => {
    try {
      console.log('✅ Fetching completed orders');
      const response = await apiClient.get('/orders/user/completed');
      console.log('✅ Completed orders fetched:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch completed orders';

      console.error('❌ Get completed orders error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get pending orders for authenticated user
   * @returns {Promise<Array>} Array of pending orders
   */
  getPendingOrders: async () => {
    try {
      console.log('⏳ Fetching pending orders');
      const response = await apiClient.get('/orders/user/pending');
      console.log('✅ Pending orders fetched:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch pending orders';

      console.error('❌ Get pending orders error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Cancel user's own order
   * @param {string|number} orderId - Order ID to cancel
   * @returns {Promise<Object>} Updated order response
   */
  cancelOrder: async (orderId) => {
    try {
      console.log('❌ Cancelling order:', orderId);
      const response = await apiClient.put(`/orders/${orderId}/cancel`);
      console.log('✅ Order cancelled:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel order';

      console.error('❌ Cancel order error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update order status (ADMIN ONLY)
   * @param {string|number} orderId - Order ID
   * @param {string} status - New status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED)
   * @returns {Promise<Object>} Updated order response
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log('🔄 Updating order status:', { orderId, status });
      const response = await apiClient.put(`/orders/${orderId}/status/${status}`);
      console.log('✅ Order status updated:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update order status';

      console.error('❌ Update order status error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete order (ADMIN ONLY)
   * @param {string|number} orderId - Order ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteOrder: async (orderId) => {
    try {
      console.log('🗑️ Deleting order:', orderId);
      const response = await apiClient.delete(`/orders/${orderId}`);
      console.log('✅ Order deleted:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete order';

      console.error('❌ Delete order error:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};
