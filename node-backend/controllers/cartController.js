const cartService = require('../services/cartService');

class CartController {
  /**
   * Get user's cart
   * GET /api/cart
   */
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cartData = await cartService.getCartItems(userId);
      
      // Calculate totals
      const cartTotal = await cartService.calculateCartTotal(userId);

      res.json({
        ...cartData,
        ...cartTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add product to cart
   * POST /api/cart/items
   * Body: { productId, quantity }
   */
  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'productId is required' });
      }

      await cartService.addToCart(userId, productId, quantity);
      const cartData = await cartService.getCartItems(userId);
      const cartTotal = await cartService.calculateCartTotal(userId);

      res.status(201).json({
        ...cartData,
        ...cartTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update item quantity
   * PUT /api/cart/items/:productId
   * Body: { quantity }
   */
  async updateItemQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ message: 'quantity is required' });
      }

      await cartService.updateItemQuantity(userId, productId, quantity);
      const cartData = await cartService.getCartItems(userId);
      const cartTotal = await cartService.calculateCartTotal(userId);

      res.json({
        ...cartData,
        ...cartTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove product from cart
   * DELETE /api/cart/items/:productId
   */
  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      await cartService.removeFromCart(userId, productId);
      const cartData = await cartService.getCartItems(userId);
      const cartTotal = await cartService.calculateCartTotal(userId);

      res.json({
        message: 'Product removed from cart',
        ...cartData,
        ...cartTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      
      await cartService.clearCart(userId);

      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sync local cart to database
   * POST /api/cart/sync
   * Body: { items: [{ productId, quantity }, ...] }
   */
  async syncLocalCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'items must be an array' });
      }

      const cartData = await cartService.mergeLocalCart(userId, items);
      const cartTotal = await cartService.calculateCartTotal(userId);

      res.json({
        message: 'Cart synced successfully',
        ...cartData,
        ...cartTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate coupon (get discount preview)
   * POST /api/cart/validate-coupon
   * Body: { couponCode }
   */
  async validateCoupon(req, res, next) {
    try {
      const userId = req.user.id;
      const { couponCode } = req.body;

      if (!couponCode) {
        return res.status(400).json({ message: 'couponCode is required' });
      }

      const cartTotal = await cartService.calculateCartTotal(userId, couponCode);

      res.json({
        message: 'Coupon is valid',
        ...cartTotal,
      });
    } catch (error) {
      // Return 400 for coupon validation errors
      if (error.message.includes('coupon') || error.message.includes('Coupon')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new CartController();
