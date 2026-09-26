const express = require('express');
const router = express.Router();

const categoryController = require('./category.controller');
const { validateCreateCategory, validateUpdateCategory } = require('./category.validation');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.post('/', restrictTo('admin', 'inventory_manager'), validateCreateCategory, categoryController.createCategory);
router.patch('/:id', restrictTo('admin', 'inventory_manager'), validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', restrictTo('admin', 'inventory_manager'), categoryController.deleteCategory);

module.exports = router;