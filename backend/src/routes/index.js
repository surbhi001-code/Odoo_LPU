const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const productRoutes = require('../modules/products/product.routes');
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
module.exports = router;