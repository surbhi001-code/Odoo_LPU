const validateCreateWarehouse = (req, res, next) => {
    const { name, code } = req.body;
    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'name and code are required' });
    }
    next();
};

const validateUpdateWarehouse = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }
    next();
};

const validateCreateLocation = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({ success: false, message: 'name is required' });
    }
    next();
};

module.exports = { validateCreateWarehouse, validateUpdateWarehouse, validateCreateLocation };