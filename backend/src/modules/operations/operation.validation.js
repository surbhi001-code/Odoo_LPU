const VALID_TYPES = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'];
const fail = (message) => { throw Object.assign(new Error(message), { statusCode: 400 }); };
const validId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const validQuantity = (value, allowZero = false) => {
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') return false;
    const quantity = Number(value);
    return Number.isFinite(quantity) && quantity >= (allowZero ? 0 : 0.01) && quantity <= 999999999999.99 && Math.abs(quantity * 100 - Math.round(quantity * 100)) < 0.01;
};
const assertDocumentInput = (data) => {
    if (!VALID_TYPES.includes(data.type)) fail('Invalid operation type');
    if (!Array.isArray(data.lines) || !data.lines.length) fail('Add at least one product line');
    const seen = new Set();
    for (const line of data.lines) {
        if (!line || !validId(line.product_id) || !validQuantity(line.quantity, data.type === 'ADJUSTMENT')) fail('Each line needs a product and a valid quantity with at most two decimals');
        if (seen.has(Number(line.product_id))) fail('Combine duplicate products into one line');
        seen.add(Number(line.product_id));
    }
    if (data.notes != null && (typeof data.notes !== 'string' || data.notes.length > 10000)) fail('Notes must be text of at most 10000 characters');
    const source = data.source_location_id;
    const destination = data.destination_location_id;
    if (data.type === 'RECEIPT' && (!validId(destination) || source != null)) fail('A receipt requires only a destination location');
    if (['DELIVERY', 'ADJUSTMENT'].includes(data.type) && (!validId(source) || destination != null)) fail('This operation requires only a source location');
    if (data.type === 'TRANSFER' && (!validId(source) || !validId(destination) || Number(source) === Number(destination))) fail('Select different source and destination locations');
};
const validateCreateDocument = (req, res, next) => {
    try { assertDocumentInput(req.body || {}); next(); } catch (error) { next(error); }
};
const validateUpdateDocument = (req, res, next) => {
    const allowed = ['partner_name', 'scheduled_date', 'notes', 'lines', 'source_location_id', 'destination_location_id', 'status'];
    if (!req.body || !Object.keys(req.body).length || Object.keys(req.body).some(key => !allowed.includes(key))) return next(Object.assign(new Error('Provide supported operation fields to update'), { statusCode: 400 }));
    if (req.body.status !== undefined && !['DRAFT', 'WAITING', 'READY'].includes(req.body.status)) return next(Object.assign(new Error('Use the validate or cancel action to complete an operation'), { statusCode: 400 }));
    next();
};
module.exports = { validateCreateDocument, validateUpdateDocument, VALID_TYPES, assertDocumentInput, validQuantity, validId };
