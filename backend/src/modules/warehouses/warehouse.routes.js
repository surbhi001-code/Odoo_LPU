const express = require('express');
const router = express.Router();

const warehouseController = require('./warehouse.controller');
const {
    validateCreateWarehouse,
    validateUpdateWarehouse,
    validateCreateLocation
} = require('./warehouse.validation');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouseById);
router.post('/', restrictTo('admin', 'inventory_manager'), validateCreateWarehouse, warehouseController.createWarehouse);
router.patch('/:id', restrictTo('admin', 'inventory_manager'), validateUpdateWarehouse, warehouseController.updateWarehouse);
router.delete('/:id', restrictTo('admin', 'inventory_manager'), warehouseController.deleteWarehouse);

// nested location routes
router.get('/:id/locations', warehouseController.getLocationsByWarehouse);
router.post('/:id/locations', restrictTo('admin', 'inventory_manager'), validateCreateLocation, warehouseController.createLocation);
router.delete('/locations/:locationId', restrictTo('admin', 'inventory_manager'), warehouseController.deleteLocation);

module.exports = router;