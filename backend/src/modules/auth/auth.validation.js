const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' });
    }
    next();
};

const validateForgotPassword = (req, res, next) => {
    if (!req.body.email) {
        return res.status(400).json({ success: false, message: 'email is required' });
    }
    next();
};

const validateResetPassword = (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'email, otp and newPassword are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    next();
};

module.exports = { validateSignup, validateLogin, validateForgotPassword, validateResetPassword };