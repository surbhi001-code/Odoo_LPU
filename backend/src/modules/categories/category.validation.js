const validateCreateCategory = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({ success: false, message: 'name is required' });
    }
    next();
};

const validateUpdateCategory = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }
    next();
};

module.exports = { validateCreateCategory, validateUpdateCategory };