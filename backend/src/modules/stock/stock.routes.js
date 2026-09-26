const express = require('express');
const router = express.Router();

const stockController = require('./stock.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/inventory', stockController.getInventoryBalance);
router.get('/ledger', stockController.getLedger);
router.get('/low-stock', stockController.getLowStockProducts);

module.exports = router;