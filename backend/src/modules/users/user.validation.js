const validateUpdateProfile = (req, res, next) => {
    const allowed = ['name'];
    const keys = Object.keys(req.body || {});

    if (keys.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    const invalidKeys = keys.filter((k) => !allowed.includes(k));
    if (invalidKeys.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot update fields: ${invalidKeys.join(', ')}. Only name can be changed here.`
        });
    }

    next();
};

const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'newPassword must be at least 6 characters' });
    }
    next();
};

module.exports = { validateUpdateProfile, validateChangePassword };