const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const { validateUpdateProfile, validateChangePassword } = require('./user.validation');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/me', userController.getProfile);
router.patch('/me', validateUpdateProfile, userController.updateProfile);
router.patch('/me/password', validateChangePassword, userController.changePassword);

module.exports = router;