const express = require('express');
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// Get cart
router.get('/', cartController.getCart);

// Add to cart
router.post('/items', cartController.addToCart);

// Update item quantity
router.put('/items/:productId', cartController.updateItemQuantity);

// Remove from cart
router.delete('/items/:productId', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

// Sync local cart to database
router.post('/sync', cartController.syncLocalCart);

// Validate coupon
router.post('/validate-coupon', cartController.validateCoupon);

module.exports = router;
