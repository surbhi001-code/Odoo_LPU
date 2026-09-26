const { Op } = require('sequelize');
const { sequelize, Document, DocumentLine, Product, Location, Inventory } = require('../../database/models');
const stockService = require('../stock/stock.service');
const { assertDocumentInput } = require('./operation.validation');

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

const checkReferences = async (data, transaction) => {
    for (const line of data.lines) {
        const product = await Product.findByPk(line.product_id, { transaction });
        if (!product || !product.is_active) throw Object.assign(new Error('A selected product no longer exists or is inactive'), { statusCode: 400 });
    }
    for (const id of [data.source_location_id, data.destination_location_id].filter(Boolean)) {
        if (!await Location.findByPk(id, { transaction })) throw Object.assign(new Error('A selected location no longer exists'), { statusCode: 400 });
    }
};

const createDocument = async (data, userId) => {
    return sequelize.transaction(async (transaction) => {
        assertDocumentInput(data);
        await checkReferences(data, transaction);
        const reference_no = await generateReferenceNo(data.type, transaction);

        const document = await Document.create({
            type: data.type,
            reference_no,
            status: 'DRAFT',
            source_location_id: data.source_location_id || null,
            destination_location_id: data.destination_location_id || null,
            partner_name: data.partner_name || null,
            notes: data.notes || null,
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

const getAllDocuments = async ({ type, status, warehouse_id, category_id, location_id, page = 1, limit = 20 }) => {
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (location_id) {
        where[Op.or] = [
            { source_location_id: location_id },
            { destination_location_id: location_id },
        ];
    }

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

const updateDocument = async (id, data) => sequelize.transaction(async (transaction) => {
    const document = await Document.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!document) throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    if (['DONE', 'CANCELED'].includes(document.status)) throw Object.assign(new Error('Completed or canceled operations cannot be edited'), { statusCode: 400 });
    if (data.status !== undefined && !['DRAFT', 'WAITING', 'READY'].includes(data.status)) throw Object.assign(new Error('Use validate or cancel to complete an operation'), { statusCode: 400 });
    const lines = data.lines === undefined ? await DocumentLine.findAll({ where: { document_id: id }, transaction }) : data.lines;
    const merged = { ...document.get({ plain: true }), ...data, type: document.type, lines };
    assertDocumentInput(merged);
    if (data.lines !== undefined || data.source_location_id !== undefined || data.destination_location_id !== undefined) await checkReferences(merged, transaction);
    const updates = {};
    for (const field of ['partner_name', 'scheduled_date', 'notes', 'status', 'source_location_id', 'destination_location_id']) {
        if (data[field] !== undefined) updates[field] = data[field];
    }
    // Changed quantities/locations must be reviewed again before validation.
    if (data.lines !== undefined || ['source_location_id', 'destination_location_id'].some(field => data[field] !== undefined && Number(data[field]) !== Number(document[field]))) updates.status = 'DRAFT';
    await document.update(updates, { transaction });
    if (data.lines !== undefined) {
        await DocumentLine.destroy({ where: { document_id: id }, transaction });
        await DocumentLine.bulkCreate(data.lines.map(line => ({ document_id: id, product_id: Number(line.product_id), quantity: Number(line.quantity) })), { transaction });
    }
    return document;
});

const cancelDocument = async (id) => sequelize.transaction(async (transaction) => {
    const document = await Document.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!document) throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    if (document.status === 'DONE') throw Object.assign(new Error('A validated operation cannot be canceled'), { statusCode: 400 });
    await document.update({ status: 'CANCELED' }, { transaction });
    return document;
});

// The core action: validating a document actually moves stock.
const validateDocument = async (id, userId) => {
    return sequelize.transaction(async (transaction) => {
        const document = await Document.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        if (document) document.lines = await DocumentLine.findAll({ where: { document_id: id }, transaction });

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