// Trusted server-operator tool for an existing account; never creates users.
// Usage: node backend/scripts/set-user-role.js --email person@example.com --role inventory_manager
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const { Sequelize, QueryTypes } = require('sequelize');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) options[args[i]] = args[i + 1];
const email = options['--email']?.trim();
const role = options['--role'];
if (args.length !== 4 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['warehouse_staff', 'inventory_manager', 'admin'].includes(role)) {
    console.error('Provide --email and --role (warehouse_staff, inventory_manager or admin).');
    process.exit(1);
}
const database = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST, dialect: 'mysql', logging: false,
    dialectOptions: { connectTimeout: 10000 }
});
(async () => {
    try {
        await database.transaction(async transaction => {
            const users = await database.query('SELECT id, email, role, is_active FROM users WHERE email = :email FOR UPDATE', { replacements: { email }, type: QueryTypes.SELECT, transaction });
            if (users.length !== 1 || !users[0].is_active) throw new Error('Exactly one active existing account is required.');
            const user = users[0];
            if (user.role === 'admin' && role !== 'admin') throw new Error('This tool does not demote administrators.');
            if (user.role !== role) await database.query('UPDATE users SET role = :role, updated_at = CURRENT_TIMESTAMP WHERE id = :id', { replacements: { role, id: user.id }, transaction });
            const [verified] = await database.query('SELECT role FROM users WHERE id = :id', { replacements: { id: user.id }, type: QueryTypes.SELECT, transaction });
            if (verified.role !== role) throw new Error('Role verification failed.');
            console.log(`${user.email}: ${user.role} -> ${verified.role}`);
        });
    } catch (error) {
        console.error(error.name === 'Error' ? error.message : `Role update failed (${error.name}).`);
        process.exitCode = 1;
    } finally { await database.close(); }
})();
