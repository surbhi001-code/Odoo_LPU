const bcrypt = require('bcrypt');
const { User } = require('../../database/models');
const generateToken = require('../../utils/generateToken');
const generateOtp = require('../../utils/generateOtp');
const sendEmail = require('../../utils/sendEmail');
const SALT_ROUNDS = 10;

const signup = async ({ name, email, password, role }) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        const err = new Error('Email already registered');
        err.statusCode = 409;
        throw err;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        name,
        email,
        password_hash,
        role: role || 'warehouse_staff'
    });

    const token = generateToken({ id: user.id, role: user.role });

    return { user, token };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = generateToken({ id: user.id, role: user.role });

    return { user, token };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        const err = new Error('No account found with this email');
        err.statusCode = 404;
        throw err;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp_code = otp;
    user.otp_expires_at = expiresAt;
    await user.save();

   await sendEmail({
    to: email,
    subject: 'StockSense Password Reset OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`
});
    return otp;
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const user = await User.findOne({ where: { email } });
    if (!user || user.otp_code !== otp) {
        const err = new Error('Invalid OTP');
        err.statusCode = 400;
        throw err;
    }

    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
        const err = new Error('OTP has expired');
        err.statusCode = 400;
        throw err;
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    return true;
};

module.exports = { signup, login, forgotPassword, resetPassword };