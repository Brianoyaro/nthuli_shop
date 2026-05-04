const { Order, OrderItem, Cart, CartItem, Product, Coupon, User } = require('../models');
const { ORDER_STATUS, DISCOUNT_TYPE } = require('../models/enums');

class OrderService {
  /**
   * Generate unique order number
   */
  async generateOrderNumber() {
    try {
      const count = await Order.count();
      const timestamp = Date.now().toString().slice(-6);
      return `ORD-${timestamp}-${String(count + 1).padStart(5, '0')}`;
    } catch (error) {
      throw new Error(`Failed to generate order number: ${error.message}`);
    }
  }

  /**
   * Create order from cart (main checkout logic)
   */
  async createOrderFromCart(userId, couponCode = null) {
    try {
      const { Cart: CartModel, CartItem: CartItemModel } = require('../models');
      const cartService = require('./cartService');

      // Get user's cart
      const cart = await CartModel.findOne({ where: { userId } });
      if (!cart) {
        throw new Error('Cart not found');
      }

      // Get cart items
      const cartItems = await CartItemModel.findAll({
        where: { cartId: cart.id },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
          },
        ],
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total and validate coupon
      let totalAmount = 0;
      let discountAmount = 0;
      let coupon = null;

      for (const item of cartItems) {
        totalAmount += parseFloat(item.product.price) * item.quantity;
      }

      if (couponCode) {
        coupon = await Coupon.findOne({
          where: { code: couponCode.toUpperCase() },
        });

        if (!coupon) {
          throw new Error('Invalid coupon code');
        }

        if (!coupon.isActive) {
          throw new Error('Coupon is inactive');
        }

        const now = new Date();
        if (coupon.validFrom > now || coupon.validUntil < now) {
          throw new Error('Coupon is not valid at this time');
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new Error('Coupon usage limit reached');
        }

        // Calculate discount
        if (coupon.discountType === DISCOUNT_TYPE.PERCENTAGE) {
          discountAmount = totalAmount * (parseFloat(coupon.discountValue) / 100);
        } else if (coupon.discountType === DISCOUNT_TYPE.FIXED) {
          discountAmount = Math.min(parseFloat(coupon.discountValue), totalAmount);
        }
      }

      const finalTotal = parseFloat((totalAmount - discountAmount).toFixed(2));

      // Create order
      const orderNumber = await this.generateOrderNumber();
      const order = await Order.create({
        userId,
        orderNumber,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        status: ORDER_STATUS.PENDING,
        couponId: coupon ? coupon.id : null,
      });

      // Create order items (snapshot of cart items with prices)
      for (const cartItem of cartItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: parseFloat(cartItem.product.price),
          subtotal: parseFloat((cartItem.product.price * cartItem.quantity).toFixed(2)),
        });
      }

      // Increment coupon usage if applied
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }

      // Clear user's cart
      await CartItemModel.destroy({ where: { cartId: cart.id } });

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        finalTotal,
        status: order.status,
        createdAt: order.createdAt,
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Get order by ID with items
   */
  async getOrderById(orderId, userId = null) {
    try {
      const whereClause = { id: orderId };
      if (userId) {
        whereClause.userId = userId;
      }

      const order = await Order.findOne({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
          {
            model: Coupon,
            as: 'coupon',
            attributes: ['code', 'discountType', 'discountValue'],
          },
        ],
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  /**
   * Get user's orders with pagination
   */
  async getUserOrders(userId, limit = 10, offset = 0) {
    try {
      const { count, rows } = await Order.findAndCountAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            as: 'items',
            attributes: ['quantity', 'unitPrice', 'subtotal'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        total: count,
        orders: rows,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user orders: ${error.message}`);
    }
  }

  /**
   * Get all orders (admin) with filters and pagination
   */
  async getAllOrders(filters = {}, limit = 10, offset = 0) {
    try {
      const whereClause = {};

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) {
          whereClause.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          whereClause.createdAt.$lte = new Date(filters.endDate);
        }
      }

      const { count, rows } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
          {
            model: OrderItem,
            as: 'items',
            attributes: ['quantity', 'unitPrice'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        total: count,
        orders: rows,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get all orders: ${error.message}`);
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const validStatuses = Object.values(ORDER_STATUS);
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transitions
      const validTransitions = {
        [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.DELIVERED]: [],
        [ORDER_STATUS.CANCELLED]: [],
      };

      if (!validTransitions[order.status].includes(newStatus)) {
        throw new Error(
          `Cannot transition from ${order.status} to ${newStatus}`
        );
      }

      order.status = newStatus;
      await order.save();

      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  /**
   * Cancel order
   * Users can only cancel PENDING orders
   * Admins can cancel any order
   */
  async cancelOrder(orderId, userId = null, isAdmin = false) {
    try {
      const whereClause = { id: orderId };
      if (userId && !isAdmin) {
        whereClause.userId = userId;
        whereClause.status = ORDER_STATUS.PENDING;
      }

      const order = await Order.findOne({ where: whereClause });
      if (!order) {
        throw new Error('Order not found or cannot be cancelled');
      }

      if (!isAdmin && order.status !== ORDER_STATUS.PENDING) {
        throw new Error('Only PENDING orders can be cancelled by users');
      }

      order.status = ORDER_STATUS.CANCELLED;
      await order.save();

      return order;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }
}

module.exports = new OrderService();
