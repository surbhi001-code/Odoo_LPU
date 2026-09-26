const { Warehouse, Location, Inventory } = require('../../database/models');

const createWarehouse = async ({ name, code, address }) => {
    const existing = await Warehouse.findOne({ where: { code } });
    if (existing) {
        const err = new Error('Warehouse code already exists');
        err.statusCode = 409;
        throw err;
    }
    return Warehouse.create({ name, code, address });
};

const getAllWarehouses = async () => {
    return Warehouse.findAll({
        include: [{ model: Location, attributes: ['id', 'name', 'code'] }],
        order: [['name', 'ASC']]
    });
};

const getWarehouseById = async (id) => {
    const warehouse = await Warehouse.findByPk(id, {
        include: [{ model: Location, attributes: ['id', 'name', 'code'] }]
    });
    if (!warehouse) {
        const err = new Error('Warehouse not found');
        err.statusCode = 404;
        throw err;
    }
    return warehouse;
};

const updateWarehouse = async (id, data) => {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) {
        const err = new Error('Warehouse not found');
        err.statusCode = 404;
        throw err;
    }

    if (data.code && data.code !== warehouse.code) {
        const existing = await Warehouse.findOne({ where: { code: data.code } });
        if (existing) {
            const err = new Error('Warehouse code already in use');
            err.statusCode = 409;
            throw err;
        }
    }

    await warehouse.update(data);
    return warehouse;
};

const deleteWarehouse = async (id) => {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) {
        const err = new Error('Warehouse not found');
        err.statusCode = 404;
        throw err;
    }

    const locationCount = await Location.count({ where: { warehouse_id: id } });
    if (locationCount > 0) {
        const err = new Error('Cannot delete warehouse with existing locations. Delete its locations first.');
        err.statusCode = 400;
        throw err;
    }

    await warehouse.destroy();
    return true;
};

// --- Locations (nested under warehouse) ---

const createLocation = async (warehouseId, { name, code }) => {
    const warehouse = await Warehouse.findByPk(warehouseId);
    if (!warehouse) {
        const err = new Error('Warehouse not found');
        err.statusCode = 404;
        throw err;
    }

    return Location.create({ warehouse_id: warehouseId, name, code });
};

const getLocationsByWarehouse = async (warehouseId) => {
    return Location.findAll({ where: { warehouse_id: warehouseId }, order: [['name', 'ASC']] });
};

const deleteLocation = async (locationId) => {
    const location = await Location.findByPk(locationId);
    if (!location) {
        const err = new Error('Location not found');
        err.statusCode = 404;
        throw err;
    }

    // block delete if it still holds stock — check inventory, not just existence
    const stockCount = await Inventory.count({ where: { location_id: locationId } });
    if (stockCount > 0) {
        const err = new Error('Cannot delete a location that still holds inventory');
        err.statusCode = 400;
        throw err;
    }

    await location.destroy();
    return true;
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