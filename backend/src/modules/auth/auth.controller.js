const authService = require('./auth.service');
const cookieOptions = require('../../utils/cookieOptions');

const signup = async (req, res, next) => {
    try {
        const { user, token } = await authService.signup(req.body);
        res.cookie('token', token, cookieOptions);
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
        res.cookie('token', token, cookieOptions);
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

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const getMe = (req, res) => res.json({ success: true, data: publicUser(req.user) });
const updateMe = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user, req.body);
        res.json({ success: true, data: publicUser(user) });
    } catch (err) { next(err); }
};

module.exports = { signup, login, logout, forgotPassword, resetPassword, getMe, updateMe };
