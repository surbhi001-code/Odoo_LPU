const authService = require('./auth.service');

const signup = async (req, res, next) => {
    try {
        const { user, token } = await authService.signup(req.body);
        res.status(201).json({
            success: true,
            data: {
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            }
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { user, token } = await authService.login(req.body);
        res.status(200).json({
            success: true,
            data: {
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            }
        });
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body);
        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
};

module.exports = { signup, login, forgotPassword, resetPassword };