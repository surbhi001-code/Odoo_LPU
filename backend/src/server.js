require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/db');
require('./database/models'); // ensures all models + associations are loaded before sync

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // local dev only — auto-alters tables to match models
        await sequelize.sync({ alter: true });
        console.log('Models synced with database.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();