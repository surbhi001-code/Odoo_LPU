const { Op, Transaction } = require('sequelize');
const { sequelize, Inventory, StockLedger, Product, Location, Warehouse } = require('../../database/models');

// finds the product+location balance row, or creates one at zero if it's the first ever movement there
const getOrCreateInventoryRow = async (productId, locationId, transaction) => {
    let inventory = await Inventory.findOne({
        where: { product_id: productId, location_id: locationId },
        transaction,
        lock: Transaction.LOCK.UPDATE // row-level lock — prevents two simultaneous movements from reading the same stale balance
    });

    if (!inventory) {
        inventory = await Inventory.create(
            { product_id: productId, location_id: locationId, quantity: 0 },
            { transaction }
        );
    }

    return inventory;
};

/**
 * The ONLY function allowed to change inventory.quantity.
 * Pass sourceLocationId to decrement (stock leaving a location),
 * destinationLocationId to increment (stock arriving at a location),
 * or both for a transfer (decrement source, increment destination) in one atomic call.
 *
 * If called from inside an existing transaction (e.g. operations module looping over
 * multiple document lines), pass that transaction as externalTransaction so everything
 * commits or rolls back together as one unit.
 */
const applyMovement = async (
    { productId, quantity, sourceLocationId, destinationLocationId, documentId, documentType },
    externalTransaction
) => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
        const err = new Error('Movement quantity must be a positive number');
        err.statusCode = 400;
        throw err;
    }

    if (!sourceLocationId && !destinationLocationId) {
        const err = new Error('At least one of sourceLocationId or destinationLocationId is required');
        err.statusCode = 400;
        throw err;
    }

    const run = async (transaction) => {
        if (sourceLocationId) {
            const sourceInventory = await getOrCreateInventoryRow(productId, sourceLocationId, transaction);
            const currentQty = parseFloat(sourceInventory.quantity);

            if (currentQty < qty) {
                const err = new Error('Insufficient stock at source location');
                err.statusCode = 400;
                throw err;
            }

            const newBalance = currentQty - qty;
            sourceInventory.quantity = newBalance;
            await sourceInventory.save({ transaction });

            await StockLedger.create({
                product_id: productId,
                location_id: sourceLocationId,
                change_qty: -qty,
                balance_after: newBalance,
                document_id: documentId,
                document_type: documentType
            }, { transaction });
        }

        if (destinationLocationId) {
            const destInventory = await getOrCreateInventoryRow(productId, destinationLocationId, transaction);
            const newBalance = parseFloat(destInventory.quantity) + qty;

            destInventory.quantity = newBalance;
            await destInventory.save({ transaction });

            await StockLedger.create({
                product_id: productId,
                location_id: destinationLocationId,
                change_qty: qty,
                balance_after: newBalance,
                document_id: documentId,
                document_type: documentType
            }, { transaction });
        }
    };

    if (externalTransaction) {
        await run(externalTransaction);
    } else {
        await sequelize.transaction(run);
    }
};

// current stock balances — powers Products' "stock availability per location" and general inventory views
const getInventoryBalance = async ({ product_id, location_id, warehouse_id, page = 1, limit = 20 }) => {
    const where = {};
    if (product_id) where.product_id = product_id;
    if (location_id) where.location_id = location_id;

    const locationInclude = {
        model: Location,
        attributes: ['id', 'name', 'warehouse_id'],
        include: [{ model: Warehouse, attributes: ['id', 'name'] }]
    };
    if (warehouse_id) {
        locationInclude.where = { warehouse_id };
        locationInclude.required = true;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Inventory.findAndCountAll({
        where,
        include: [
            { model: Product, attributes: ['id', 'name', 'sku', 'unit_of_measure'] },
            locationInclude
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['updated_at', 'DESC']]
    });

    return {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        inventory: rows
    };
};

// Move History page — full audit trail, filterable
const getLedger = async ({ product_id, location_id, document_type, page = 1, limit = 20 }) => {
    const where = {};
    if (product_id) where.product_id = product_id;
    if (location_id) where.location_id = location_id;
    if (document_type) where.document_type = document_type;

    const offset = (page - 1) * limit;

    const { count, rows } = await StockLedger.findAndCountAll({
        where,
        include: [
            { model: Product, attributes: ['id', 'name', 'sku'] },
            { model: Location, attributes: ['id', 'name'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        ledger: rows
    };
};

// dashboard KPI: low/out of stock — total stock per product summed across all locations vs its reorder_point
const getLowStockProducts = async () => {
    const products = await Product.findAll({
        where: { is_active: true },
        include: [{ model: Inventory, attributes: ['quantity'] }]
    });

    return products
        .map((p) => {
            const totalStock = p.Inventories.reduce((sum, inv) => sum + parseFloat(inv.quantity), 0);
            return {
                id: p.id,
                name: p.name,
                sku: p.sku,
                totalStock,
                reorder_point: parseFloat(p.reorder_point)
            };
        })
        .filter((p) => p.totalStock <= p.reorder_point);
};

module.exports = { applyMovement, getInventoryBalance, getLedger, getLowStockProducts };