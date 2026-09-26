const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
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

module.exports = router;