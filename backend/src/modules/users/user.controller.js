const userService = require('./user.service');

const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        await userService.changePassword(req.user.id, req.body);
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, updateProfile, changePassword };