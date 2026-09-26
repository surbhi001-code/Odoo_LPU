const operationService = require('./operation.service');

const createDocument = async (req, res, next) => {
    try {
        const result = await operationService.createDocument(req.body, req.user.id);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getAllDocuments = async (req, res, next) => {
    try {
        const result = await operationService.getAllDocuments({ ...req.query, type: req.query.type });
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getDocumentById = async (req, res, next) => {
    try {
        const document = await operationService.getDocumentById(req.params.id);
        res.status(200).json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
};

const updateDocument = async (req, res, next) => {
    try {
        const document = await operationService.updateDocument(req.params.id, req.body);
        res.status(200).json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
};

const cancelDocument = async (req, res, next) => {
    try {
        const document = await operationService.cancelDocument(req.params.id);
        res.status(200).json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
};

const validateDocument = async (req, res, next) => {
    try {
        const document = await operationService.validateDocument(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Document validated, stock updated', data: document });
    } catch (err) {
        next(err);
    }
};

module.exports = { createDocument, getAllDocuments, getDocumentById, updateDocument, cancelDocument, validateDocument };