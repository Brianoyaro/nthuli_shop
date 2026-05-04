import apiClient from './api';

export const cartAPI = {
  /**
   * Get user's cart from database
   * @returns {Object} Cart data with items and totals
   */
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  /**
   * Add product to cart
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Object} Updated cart
   */
  addToCart: async (productId, quantity = 1) => {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update product quantity in cart
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Object} Updated cart
   */
  updateQuantity: async (productId, quantity) => {
    const response = await apiClient.put(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  },

  /**
   * Remove product from cart
   * @param {number} productId - Product ID
   * @returns {Object} Updated cart
   */
  removeFromCart: async (productId) => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   * @returns {Object} Response
   */
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  /**
   * Sync local cart items to database
   * @param {Array} items - Array of {productId, quantity}
   * @returns {Object} Merged cart from database
   */
  syncLocalCart: async (items) => {
    const response = await apiClient.post('/cart/sync', { items });
    return response.data;
  },

  /**
   * Validate coupon code
   * @param {string} couponCode - Coupon code to validate
   * @returns {Object} Cart totals with discount applied
   */
  validateCoupon: async (couponCode) => {
    const response = await apiClient.post('/cart/validate-coupon', {
      couponCode,
    });
    return response.data;
  },
};

export default cartAPI;
