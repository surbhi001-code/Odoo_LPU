const { Category, Product } = require('../../database/models');

const createCategory = async ({ name, description }) => {
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
        const err = new Error('Category already exists');
        err.statusCode = 409;
        throw err;
    }

    return Category.create({ name, description });
};

const getAllCategories = async () => {
    return Category.findAll({ order: [['name', 'ASC']] });
};

const getCategoryById = async (id) => {
    const category = await Category.findByPk(id);
    if (!category) {
        const err = new Error('Category not found');
        err.statusCode = 404;
        throw err;
    }
    return category;
};

const updateCategory = async (id, data) => {
    const category = await Category.findByPk(id);
    if (!category) {
        const err = new Error('Category not found');
        err.statusCode = 404;
        throw err;
    }

    if (data.name && data.name !== category.name) {
        const existing = await Category.findOne({ where: { name: data.name } });
        if (existing) {
            const err = new Error('Category name already in use');
            err.statusCode = 409;
            throw err;
        }
    }

    await category.update(data);
    return category;
};

const deleteCategory = async (id) => {
    const category = await Category.findByPk(id);
    if (!category) {
        const err = new Error('Category not found');
        err.statusCode = 404;
        throw err;
    }

    // block delete if products still reference it — no soft-delete flag on categories,
    // so this is the guard against orphaning product_id → category_id
    const productCount = await Product.count({ where: { category_id: id } });
    if (productCount > 0) {
        const err = new Error('Cannot delete category with existing products assigned to it');
        err.statusCode = 400;
        throw err;
    }

    await category.destroy();
    return true;
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };