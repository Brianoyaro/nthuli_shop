const orderService = require('../services/orderService');
const { ORDER_STATUS } = require('../models/enums');

class OrderController {
  /**
   * Create order from cart (checkout)
   * POST /api/checkout
   * Body: { couponCode? }
   */
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { couponCode } = req.body;

      const order = await orderService.createOrderFromCart(userId, couponCode);

      res.status(201).json({
        message: 'Order created successfully',
        order,
        nextStep: 'Please proceed to payment',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   * GET /api/orders?limit=10&offset=0
   */
  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await orderService.getUserOrders(userId, limit, offset);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order details
   * GET /api/orders/:orderId
   */
  async getOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await orderService.getOrderById(orderId, userId);

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order (user)
   * PATCH /api/orders/:orderId/cancel
   */
  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await orderService.cancelOrder(orderId, userId, false);

      res.json({
        message: 'Order cancelled successfully',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin)
   * GET /api/admin/orders?status=PENDING&limit=10&offset=0
   */
  async getAllOrders(req, res, next) {
    try {
      const { status, startDate, endDate, limit = 10, offset = 0 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const result = await orderService.getAllOrders(
        filters,
        parseInt(limit),
        parseInt(offset)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID (admin)
   * GET /api/admin/orders/:orderId
   */
  async getOrderAdmin(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await orderService.getOrderById(orderId);

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (admin)
   * PATCH /api/admin/orders/:orderId/status
   * Body: { status }
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'status is required' });
      }

      const validStatuses = Object.values(ORDER_STATUS);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
        });
      }

      const order = await orderService.updateOrderStatus(orderId, status);

      res.json({
        message: 'Order status updated successfully',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order (admin)
   * PATCH /api/admin/orders/:orderId/cancel
   */
  async cancelOrderAdmin(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await orderService.cancelOrder(orderId, null, true);

      res.json({
        message: 'Order cancelled successfully',
        order,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
