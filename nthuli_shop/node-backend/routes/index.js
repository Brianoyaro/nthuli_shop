const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/products', productRoutes);
router.use('/api/categories', categoryRoutes);

module.exports = router;
