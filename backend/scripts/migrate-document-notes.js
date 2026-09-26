// Additive, repeatable migration; never alters or drops existing columns.
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const { Sequelize, DataTypes } = require('sequelize');
const database = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST, dialect: 'mysql', logging: false,
    dialectOptions: { connectTimeout: 10000 }
});

(async () => {
    try {
        const query = database.getQueryInterface();
        const columns = await query.describeTable('documents');
        if (!columns.notes) {
            await query.addColumn('documents', 'notes', { type: DataTypes.TEXT, allowNull: true });
            console.log('Added documents.notes; existing records preserved.');
        } else console.log('documents.notes already exists.');
    } catch (error) {
        console.error(`Notes migration failed (${error.name}). Check database connectivity and permissions.`);
        process.exitCode = 1;
    } finally { await database.close(); }
})();
