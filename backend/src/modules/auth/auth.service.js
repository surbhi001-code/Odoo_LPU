const bcrypt = require('bcrypt');
const { fn, col, where } = require('sequelize');
const { User } = require('../../database/models');
const generateToken = require('../../utils/generateToken');
const generateOtp = require('../../utils/generateOtp');
const sendEmail = require('../../utils/sendEmail');
const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const findUserByEmail = (email) =>
    User.findOne({
        where: where(fn('LOWER', col('email')), normalizeEmail(email)),
    });

const otpMatches = (stored, submitted) => {
    const expected = String(stored || '').replace(/\s/g, '');
    const given = String(submitted || '').replace(/\s/g, '');
    if (!expected || !given) return false;
    return expected === given || Number(expected) === Number(given);
};

const signupRoles = ['warehouse_staff', 'inventory_manager'];

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
        role: signupRoles.includes(role) ? role : 'warehouse_staff'
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
    const user = await findUserByEmail(email);
    if (!user) {
        const err = new Error('No account found with this email');
        err.statusCode = 404;
        throw err;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp_code = String(otp);
    user.otp_expires_at = expiresAt;
    await user.save();

   await sendEmail({
    to: user.email,
    subject: 'StockSense Password Reset OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`
});
    return otp;
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const user = await findUserByEmail(email);
    if (!user) {
        const err = new Error('No account found with this email');
        err.statusCode = 404;
        throw err;
    }
    if (!otpMatches(user.otp_code, otp)) {
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

const updateProfile = async (user, data) => {
    const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
    if (!data || Object.keys(data).some(key => !['name', 'email', 'currentPassword'].includes(key))) fail('Only name and email can be edited here');
    if (data.name === undefined && data.email === undefined) fail('Provide a name or email to update');
    const updates = {};
    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 255) fail('Enter a valid name');
        updates.name = data.name.trim();
    }
    if (data.email !== undefined) {
        if (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) || data.email.trim().length > 255) fail('Enter a valid email address');
        const email = data.email.trim().toLowerCase();
        if (email !== user.email.toLowerCase()) {
            if (typeof data.currentPassword !== 'string' || !await bcrypt.compare(data.currentPassword, user.password_hash)) fail('Your current password is required to change email', 403);
            const existing = await User.findOne({ where: { email } });
            if (existing && existing.id !== user.id) fail('Email already registered', 409);
            updates.email = email;
            updates.otp_code = null;
            updates.otp_expires_at = null;
        }
    }
    try { await user.update(updates); }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') fail('Email already registered', 409);
        throw error;
    }
    return user;
};

module.exports = { signup, login, forgotPassword, resetPassword, updateProfile };
