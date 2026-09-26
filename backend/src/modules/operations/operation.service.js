const { sequelize, Document, DocumentLine, Product, Location, Inventory } = require('../../database/models');
const stockService = require('../stock/stock.service');

const REFERENCE_PREFIX = {
    RECEIPT: 'REC',
    DELIVERY: 'DEL',
    TRANSFER: 'TRN',
    ADJUSTMENT: 'ADJ'
};

const generateReferenceNo = async (type, transaction) => {
    const count = await Document.count({ where: { type }, transaction });
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `${REFERENCE_PREFIX[type]}-${nextNumber}`;
};

const createDocument = async (data, userId) => {
    return sequelize.transaction(async (transaction) => {
        const reference_no = await generateReferenceNo(data.type, transaction);

        const document = await Document.create({
            type: data.type,
            reference_no,
            status: 'DRAFT',
            source_location_id: data.source_location_id || null,
            destination_location_id: data.destination_location_id || null,
            partner_name: data.partner_name || null,
            scheduled_date: data.scheduled_date || null,
            created_by: userId
        }, { transaction });

        const lines = await Promise.all(
            data.lines.map((line) =>
                DocumentLine.create({
                    document_id: document.id,
                    product_id: line.product_id,
                    quantity: line.quantity
                }, { transaction })
            )
        );

        return { document, lines };
    });
};

const getAllDocuments = async ({ type, status, warehouse_id, category_id, page = 1, limit = 20 }) => {
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const locationWhere = warehouse_id ? { warehouse_id } : undefined;

    const productWhere = category_id ? { category_id } : undefined;

    const offset = (page - 1) * limit;

    const { count, rows } = await Document.findAndCountAll({
        where,
        include: [
            {
                model: Location,
                as: 'sourceLocation',
                attributes: ['id', 'name', 'warehouse_id'],
                where: locationWhere,
                required: !!warehouse_id
            },
            { model: Location, as: 'destinationLocation', attributes: ['id', 'name', 'warehouse_id'] },
            {
                model: DocumentLine,
                as: 'lines',
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'sku', 'category_id'],
                    where: productWhere,
                    required: !!category_id
                }],
                required: !!category_id // only pull documents that actually have a matching line
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        distinct: true
    });

    return {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        documents: rows
    };
};

const getDocumentById = async (id) => {
    const document = await Document.findByPk(id, {
        include: [
            { model: Location, as: 'sourceLocation' },
            { model: Location, as: 'destinationLocation' },
            { model: DocumentLine, as: 'lines', include: [{ model: Product, attributes: ['id', 'name', 'sku', 'unit_of_measure'] }] }
        ]
    });

    if (!document) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }

    return document;
};

const updateDocument = async (id, data) => {
    const document = await Document.findByPk(id);
    if (!document) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }

    if (document.status === 'DONE' || document.status === 'CANCELED') {
        const err = new Error(`Cannot edit a document that is already ${document.status}`);
        err.statusCode = 400;
        throw err;
    }

    const allowedFields = ['partner_name', 'scheduled_date', 'status', 'source_location_id', 'destination_location_id'];
    const updates = {};
    allowedFields.forEach((field) => {
        if (data[field] !== undefined) updates[field] = data[field];
    });

    await document.update(updates);
    return document;
};

const cancelDocument = async (id) => {
    const document = await Document.findByPk(id);
    if (!document) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }
    if (document.status === 'DONE') {
        const err = new Error('Cannot cancel a document that is already validated (DONE)');
        err.statusCode = 400;
        throw err;
    }

    document.status = 'CANCELED';
    await document.save();
    return document;
};

// The core action: validating a document actually moves stock.
const validateDocument = async (id, userId) => {
    return sequelize.transaction(async (transaction) => {
        const document = await Document.findByPk(id, {
            include: [{ model: DocumentLine, as: 'lines' }],
            transaction
        });

        if (!document) {
            const err = new Error('Document not found');
            err.statusCode = 404;
            throw err;
        }
        if (document.status === 'DONE' || document.status === 'CANCELED') {
            const err = new Error(`Document is already ${document.status}`);
            err.statusCode = 400;
            throw err;
        }
        if (!document.lines || document.lines.length === 0) {
            const err = new Error('Document has no lines to validate');
            err.statusCode = 400;
            throw err;
        }

        for (const line of document.lines) {
            if (document.type === 'ADJUSTMENT') {
                // line.quantity is the physical COUNT, not a delta — compute the difference ourselves
                const currentRow = await Inventory.findOne({
                    where: { product_id: line.product_id, location_id: document.source_location_id },
                    transaction
                });
                const currentQty = currentRow ? parseFloat(currentRow.quantity) : 0;
                const countedQty = parseFloat(line.quantity);
                const delta = countedQty - currentQty;

                if (delta === 0) continue; // no discrepancy, nothing to log

                await stockService.applyMovement({
                    productId: line.product_id,
                    quantity: Math.abs(delta),
                    // positive delta = more stock found than recorded -> destination (increase)
                    // negative delta = less stock found -> source (decrease)
                    destinationLocationId: delta > 0 ? document.source_location_id : null,
                    sourceLocationId: delta < 0 ? document.source_location_id : null,
                    documentId: document.id,
                    documentType: document.type
                }, transaction);

            } else {
                await stockService.applyMovement({
                    productId: line.product_id,
                    quantity: line.quantity,
                    sourceLocationId: document.source_location_id,
                    destinationLocationId: document.destination_location_id,
                    documentId: document.id,
                    documentType: document.type
                }, transaction);
            }
        }

        document.status = 'DONE';
        document.validated_at = new Date();
        document.validated_by = userId;
        await document.save({ transaction });

        return document;
    });
};

module.exports = {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    cancelDocument,
    validateDocument
};