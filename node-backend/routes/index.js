const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const paymentRoutes = require('./payments');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const couponRoutes = require('./coupons');

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/products', productRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/coupons', couponRoutes);

module.exports = router;
