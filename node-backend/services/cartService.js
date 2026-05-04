const { Cart, CartItem, Product, ProductImage } = require('../models');

class CartService {
  /**
   * Get or create user's cart
   */
  async getOrCreateCart(userId) {
    try {
      let cart = await Cart.findOne({ where: { userId } });
      
      if (!cart) {
        cart = await Cart.create({ userId });
      }
      
      return cart;
    } catch (error) {
      throw new Error(`Failed to get or create cart: ${error.message}`);
    }
  }

  /**
   * Get cart items with product details
   */
  async getCartItems(userId) {
    try {
      const cart = await this.getOrCreateCart(userId);
      
      const items = await CartItem.findAll({
        where: { cartId: cart.id },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'description'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['imageUrl', 'isPrimary'],
                where: { isPrimary: true },
                required: false,
              },
            ],
          },
        ],
        order: [['addedAt', 'DESC']],
      });
      
      return {
        cartId: cart.id,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: item.product,
          addedAt: item.addedAt,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get cart items: ${error.message}`);
    }
  }

  /**
   * Add product to cart
   */
  async addToCart(userId, productId, quantity = 1) {
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      // Verify product exists
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const cart = await this.getOrCreateCart(userId);

      // Check if product already in cart
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
        return existingItem;
      }

      const cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });

      return cartItem;
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  /**
   * Remove product from cart
   */
  async removeFromCart(userId, productId) {
    try {
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const deleted = await CartItem.destroy({
        where: { cartId: cart.id, productId },
      });

      if (deleted === 0) {
        throw new Error('Product not found in cart');
      }

      return { message: 'Product removed from cart' };
    } catch (error) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(userId, productId, quantity) {
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const cartItem = await CartItem.findOne({
        where: { cartId: cart.id, productId },
      });

      if (!cartItem) {
        throw new Error('Product not found in cart');
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      return cartItem;
    } catch (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        throw new Error('Cart not found');
      }

      await CartItem.destroy({ where: { cartId: cart.id } });

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  /**
   * Merge local cart items to database
   * Useful for syncing client-side cart on login
   */
  async mergeLocalCart(userId, localItems) {
    try {
      const cart = await this.getOrCreateCart(userId);

      for (const item of localItems) {
        const { productId, quantity } = item;

        if (!productId || quantity < 1) {
          continue;
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
          continue;
        }

        // Find existing item
        const existingItem = await CartItem.findOne({
          where: { cartId: cart.id, productId },
        });

        if (existingItem) {
          // Update quantity (sum local + existing)
          existingItem.quantity += quantity;
          await existingItem.save();
        } else {
          // Create new item
          await CartItem.create({
            cartId: cart.id,
            productId,
            quantity,
          });
        }
      }

      return await this.getCartItems(userId);
    } catch (error) {
      throw new Error(`Failed to merge local cart: ${error.message}`);
    }
  }

  /**
   * Calculate cart total
   */
  async calculateCartTotal(userId, couponCode = null) {
    try {
      const cartData = await this.getCartItems(userId);
      
      let total = 0;
      for (const item of cartData.items) {
        total += parseFloat(item.product.price) * item.quantity;
      }

      let discountAmount = 0;
      if (couponCode) {
        const { Coupon } = require('../models');
        const coupon = await Coupon.findOne({
          where: { code: couponCode.toUpperCase() },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          if (coupon.validFrom <= now && coupon.validUntil >= now) {
            if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
              const { DISCOUNT_TYPE } = require('../models/enums');
              if (coupon.discountType === DISCOUNT_TYPE.PERCENTAGE) {
                discountAmount = total * (parseFloat(coupon.discountValue) / 100);
              } else if (coupon.discountType === DISCOUNT_TYPE.FIXED) {
                discountAmount = Math.min(parseFloat(coupon.discountValue), total);
              }
            }
          }
        }
      }

      return {
        subtotal: parseFloat(total.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        total: parseFloat((total - discountAmount).toFixed(2)),
      };
    } catch (error) {
      throw new Error(`Failed to calculate cart total: ${error.message}`);
    }
  }
}

module.exports = new CartService();
