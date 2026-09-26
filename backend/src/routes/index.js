const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const productRoutes = require('../modules/products/product.routes');
const categoryRoutes = require('../modules/categories/category.routes');
const warehouseRoutes = require('../modules/warehouses/warehouse.routes');
const stockRoutes = require('../modules/stock/stock.routes');
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/stock', stockRoutes);
module.exports = router;