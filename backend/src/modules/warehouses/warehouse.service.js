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

    const onHand = Number(await Inventory.sum('quantity', { where: { location_id: locationId } })) || 0;
    if (onHand > 0) {
        const err = new Error('Move or adjust stock to zero at this location before deleting it');
        err.statusCode = 400;
        throw err;
    }

    await Inventory.destroy({ where: { location_id: locationId } });
    await location.destroy();
    return true;
};

const updateLocation = async (locationId, data) => {
    const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
    if (!data || !Object.keys(data).length || Object.keys(data).some(key => !['name', 'code'].includes(key))) fail('Only location name and code can be edited');
    const updates = {};
    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 255) fail('Enter a valid location name');
        updates.name = data.name.trim();
    }
    if (data.code !== undefined) {
        if (data.code !== null && (typeof data.code !== 'string' || data.code.trim().length > 255)) fail('Enter a valid location code');
        updates.code = data.code?.trim() || null;
    }
    const location = await Location.findByPk(locationId);
    if (!location) fail('Location not found', 404);
    await location.update(updates);
    return location;
};

module.exports = {
    updateLocation,
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
    createLocation,
    getLocationsByWarehouse,
    deleteLocation
};
