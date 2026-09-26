const warehouseService = require('./warehouse.service');

const createWarehouse = async (req, res, next) => {
    try {
        const warehouse = await warehouseService.createWarehouse(req.body);
        res.status(201).json({ success: true, data: warehouse });
    } catch (err) {
        next(err);
    }
};

const getAllWarehouses = async (req, res, next) => {
    try {
        const warehouses = await warehouseService.getAllWarehouses();
        res.status(200).json({ success: true, data: warehouses });
    } catch (err) {
        next(err);
    }
};

const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await warehouseService.getWarehouseById(req.params.id);
        res.status(200).json({ success: true, data: warehouse });
    } catch (err) {
        next(err);
    }
};

const updateWarehouse = async (req, res, next) => {
    try {
        const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
        res.status(200).json({ success: true, data: warehouse });
    } catch (err) {
        next(err);
    }
};

const deleteWarehouse = async (req, res, next) => {
    try {
        await warehouseService.deleteWarehouse(req.params.id);
        res.status(200).json({ success: true, message: 'Warehouse deleted' });
    } catch (err) {
        next(err);
    }
};

const createLocation = async (req, res, next) => {
    try {
        const location = await warehouseService.createLocation(req.params.id, req.body);
        res.status(201).json({ success: true, data: location });
    } catch (err) {
        next(err);
    }
};

const getLocationsByWarehouse = async (req, res, next) => {
    try {
        const locations = await warehouseService.getLocationsByWarehouse(req.params.id);
        res.status(200).json({ success: true, data: locations });
    } catch (err) {
        next(err);
    }
};

const deleteLocation = async (req, res, next) => {
    try {
        await warehouseService.deleteLocation(req.params.locationId);
        res.status(200).json({ success: true, message: 'Location deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
    createLocation,
    getLocationsByWarehouse,
    deleteLocation
};