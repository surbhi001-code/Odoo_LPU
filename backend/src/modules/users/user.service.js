const bcrypt = require('bcrypt');
const { User } = require('../../database/models');

const SALT_ROUNDS = 10;

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
    });
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    return user;
};

const updateProfile = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    await user.update(data); // only 'name' reaches here — validation middleware already blocked everything else

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        const err = new Error('Current password is incorrect');
        err.statusCode = 401;
        throw err;
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return true;
};

module.exports = { getProfile, updateProfile, changePassword };