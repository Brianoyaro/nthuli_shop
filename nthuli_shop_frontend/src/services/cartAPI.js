import apiClient from './api';

/**
 * Cart API Service
 * Handles all cart operations with backend
 * All endpoints require authentication
 */

export const cartAPI = {
  /**
   * Add item to cart
   * @param {number} productId - Product ID
   * @param {string} productName - Product name
   * @param {number} unitPrice - Unit price
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} CartItemDto
   */
  addToCart: async (productId, productName, unitPrice, quantity) => {
    try {
      console.log('➕ Adding to cart:', { productId, productName, quantity });
      const response = await apiClient.post('/cart/add', {
        productId,
        productName,
        unitPrice,
        quantity,
      });

      console.log('✅ Item added to cart:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to add item to cart';

      console.error('❌ Add to cart error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all cart items
   * @returns {Promise<Object>} { success, items: CartItemDto[], total }
   */
  getCart: async () => {
    try {
      console.log('📦 Fetching cart');
      const response = await apiClient.get('/cart');

      console.log('✅ Cart fetched:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch cart';

      console.error('❌ Get cart error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} CartItemDto
   */
  updateQuantity: async (cartItemId, quantity) => {
    try {
      console.log('✏️ Updating cart item quantity:', { cartItemId, quantity });
      const response = await apiClient.put(`/cart/${cartItemId}?quantity=${quantity}`);

      console.log('✅ Cart item quantity updated:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update cart item quantity';

      console.error('❌ Update quantity error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Remove item from cart by product ID
   * @param {number} productId - Product ID to remove
   * @returns {Promise<Object>} { success, message }
   */
  removeFromCart: async (productId) => {
    try {
      console.log('❌ Removing from cart:', productId);
      const response = await apiClient.delete(`/cart/${productId}`);

      console.log('✅ Item removed from cart:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to remove item from cart';

      console.error('❌ Remove from cart error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Clear entire cart
   * @returns {Promise<Object>} { success, message }
   */
  clearCart: async () => {
    try {
      console.log('🗑️ Clearing cart');
      const response = await apiClient.delete('/cart/clear/all');

      console.log('✅ Cart cleared:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to clear cart';

      console.error('❌ Clear cart error:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};
