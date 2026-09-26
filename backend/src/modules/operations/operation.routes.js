const express = require('express');
const router = express.Router();

const operationController = require('./operation.controller');
const { validateCreateDocument, validateUpdateDocument } = require('./operation.validation');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', operationController.getAllDocuments); // ?type=RECEIPT&status=DRAFT&warehouse_id=1
router.get('/:id', operationController.getDocumentById);

router.post('/', validateCreateDocument, operationController.createDocument);
router.patch('/:id', validateUpdateDocument, operationController.updateDocument);

router.post('/:id/validate', restrictTo('admin', 'inventory_manager'), operationController.validateDocument);
router.post('/:id/cancel', operationController.cancelDocument);

module.exports = router;