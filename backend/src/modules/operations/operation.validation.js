const VALID_TYPES = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'];

const validateCreateDocument = (req, res, next) => {
    const { type, lines } = req.body;

    if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `type must be one of ${VALID_TYPES.join(', ')}` });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({ success: false, message: 'lines must be a non-empty array' });
    }

    for (const line of lines) {
        if (!line.product_id || line.quantity === undefined || line.quantity === null) {
            return res.status(400).json({ success: false, message: 'each line requires product_id and quantity' });
        }
        if (parseFloat(line.quantity) < 0) {
            return res.status(400).json({ success: false, message: 'quantity cannot be negative' });
        }
    }

    if (type === 'RECEIPT' && !req.body.destination_location_id) {
        return res.status(400).json({ success: false, message: 'destination_location_id is required for a receipt' });
    }
    if (type === 'DELIVERY' && !req.body.source_location_id) {
        return res.status(400).json({ success: false, message: 'source_location_id is required for a delivery' });
    }
    if (type === 'TRANSFER') {
        if (!req.body.source_location_id || !req.body.destination_location_id) {
            return res.status(400).json({ success: false, message: 'source_location_id and destination_location_id are required for a transfer' });
        }
        if (req.body.source_location_id === req.body.destination_location_id) {
            return res.status(400).json({ success: false, message: 'source and destination locations must differ' });
        }
    }
    if (type === 'ADJUSTMENT' && !req.body.source_location_id) {
        return res.status(400).json({ success: false, message: 'source_location_id (the location being counted) is required for an adjustment' });
    }

    next();
};

const validateUpdateDocument = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }
    next();
};

module.exports = { validateCreateDocument, validateUpdateDocument, VALID_TYPES };