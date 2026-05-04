const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// User routes (require authentication)
router.use(authMiddleware);

// Create order from cart (checkout)
router.post('/checkout', orderController.createOrder);

// Get user's orders
router.get('/', orderController.getUserOrders);

// Get order details
router.get('/:orderId', orderController.getOrder);

// Cancel order (user)
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, orderController.getAllOrders);
router.get('/admin/:orderId', adminMiddleware, orderController.getOrderAdmin);
router.patch('/admin/:orderId/status', adminMiddleware, orderController.updateOrderStatus);
router.patch('/admin/:orderId/cancel', adminMiddleware, orderController.cancelOrderAdmin);

module.exports = router;
