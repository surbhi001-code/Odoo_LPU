const { Op } = require('sequelize');
const { Product, Category, Inventory, Location } = require('../../database/models');

const createProduct = async (data) => {
    const existing = await Product.findOne({ where: { sku: data.sku } });
    if (existing) {
        const err = new Error('SKU already exists');
        err.statusCode = 409;
        throw err;
    }

    const product = await Product.create({
        name: data.name,
        sku: data.sku,
        category_id: data.category_id || null,
        unit_of_measure: data.unit_of_measure,
        reorder_point: data.reorder_point || 0,
        reorder_qty: data.reorder_qty || null
    });

    return product;
};

const getAllProducts = async ({ search, category_id, page = 1, limit = 20 }) => {
    const where = { is_active: true };

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } }
        ];
    }

    if (category_id) {
        where.category_id = category_id;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: Category, attributes: ['id', 'name'] }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        products: rows
    };
};

const getProductById = async (id) => {
    const product = await Product.findByPk(id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            {
                model: Inventory,
                include: [{ model: Location, attributes: ['id', 'name', 'warehouse_id'] }]
            }
        ]
    });

    if (!product) {
        const err = new Error('Product not found');
        err.statusCode = 404;
        throw err;
    }

    return product;
};

const updateProduct = async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) {
        const err = new Error('Product not found');
        err.statusCode = 404;
        throw err;
    }

    if (data.sku && data.sku !== product.sku) {
        const existing = await Product.findOne({ where: { sku: data.sku } });
        if (existing) {
            const err = new Error('SKU already exists');
            err.statusCode = 409;
            throw err;
        }
    }

    await product.update(data);
    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        const err = new Error('Product not found');
        err.statusCode = 404;
        throw err;
    }

    // soft delete — keeps history intact for stock_ledger/document_lines referencing this product
    product.is_active = false;
    await product.save();

    return true;
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };