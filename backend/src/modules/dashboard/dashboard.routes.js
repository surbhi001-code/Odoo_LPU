const express = require('express');
const router = express.Router();

const dashboardController = require('./dashboard.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/kpis', dashboardController.getKpis);
router.get('/documents', dashboardController.getFilteredDocuments); // ?type=&status=&warehouse_id=

module.exports = router;