const { User, sequelize } = require('../../database/models');
const fail = (message, statusCode) => { throw Object.assign(new Error(message), { statusCode }); };
const publicFields = ['id', 'name', 'email', 'role'];

// Exact-email lookup avoids exposing the entire user directory to the UI.
const findAccount = async (email) => {
    if (typeof email !== 'string' || !email.trim() || email.length > 255) fail('Enter an account email', 400);
    const user = await User.findOne({ where: { email: email.trim(), is_active: true }, attributes: publicFields });
    if (!user) fail('No active account found for this email', 404);
    return user;
};

const changeRole = async (actorId, userId, data) => {
    if (!Number.isSafeInteger(Number(userId)) || Number(userId) <= 0) fail('Invalid account', 400);
    if (!data || Object.keys(data).length !== 1 || !['warehouse_staff', 'inventory_manager'].includes(data.role)) fail('Choose Warehouse Staff or Inventory Manager', 400);
    return sequelize.transaction(async transaction => {
        const actor = await User.findByPk(actorId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!actor?.is_active || actor.role !== 'admin') fail('Only an administrator can assign roles', 403);
        const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!user || !user.is_active) fail('Active account not found', 404);
        if (user.id === actor.id || user.role === 'admin') fail('Administrator roles cannot be changed here', 403);
        await user.update({ role: data.role }, { transaction });
        return Object.fromEntries(publicFields.map(field => [field, user[field]]));
    });
};

module.exports = { findAccount, changeRole };
