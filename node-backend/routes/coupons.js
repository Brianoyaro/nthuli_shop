const express = require('express');
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public route - get active coupons
router.get('/active', couponController.getActiveCoupons);

// Public route - validate coupon
router.post('/validate', couponController.validateCoupon);

// Admin routes - require authentication and admin role
router.use(authMiddleware);
router.post('/', adminMiddleware, couponController.createCoupon);
router.get('/', adminMiddleware, couponController.getAllCoupons);
router.get('/:couponId', adminMiddleware, couponController.getCoupon);
router.patch('/:couponId', adminMiddleware, couponController.updateCoupon);
router.delete('/:couponId', adminMiddleware, couponController.deleteCoupon);

module.exports = router;
