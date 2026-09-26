const validateCreateProduct = (req, res, next) => {
    const { name, sku, unit_of_measure } = req.body;
    if (!name || !sku || !unit_of_measure) {
        return res.status(400).json({
            success: false,
            message: 'name, sku and unit_of_measure are required'
        });
    }
    next();
};

const validateUpdateProduct = (req, res, next) => {
    // update is partial — just block empty payloads
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }
    next();
};

module.exports = { validateCreateProduct, validateUpdateProduct };