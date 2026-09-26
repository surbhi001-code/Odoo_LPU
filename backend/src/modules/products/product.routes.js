const express = require('express');
const router = express.Router();

const productController = require('./product.controller');
const { validateCreateProduct, validateUpdateProduct } = require('./product.validation');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

router.use(protect); // every product route requires login

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// only managers/admins create/edit/delete products — warehouse staff can view only
router.post('/', restrictTo('admin', 'inventory_manager'), validateCreateProduct, productController.createProduct);
router.patch('/:id', restrictTo('admin', 'inventory_manager'), validateUpdateProduct, productController.updateProduct);
router.delete('/:id', restrictTo('admin', 'inventory_manager'), productController.deleteProduct);

module.exports = router;