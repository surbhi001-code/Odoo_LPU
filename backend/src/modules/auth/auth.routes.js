const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const accessService = require('./access.service');
const {
    validateSignup,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require('./auth.validation');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);
router.get('/users', protect, restrictTo('admin'), async (req, res, next) => {
    try { res.json({ success: true, data: await accessService.findAccount(req.query.email) }); }
    catch (error) { next(error); }
});
router.patch('/users/:id/role', protect, restrictTo('admin'), async (req, res, next) => {
    try { res.json({ success: true, data: await accessService.changeRole(req.user.id, req.params.id, req.body) }); }
    catch (error) { next(error); }
});

module.exports = router;
