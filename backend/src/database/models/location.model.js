const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    warehouse_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'locations',
    timestamps: true,
    underscored: true
});

module.exports = Location;