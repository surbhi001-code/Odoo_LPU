const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'inventory',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['product_id', 'location_id'] }
    ]
});

module.exports = Inventory;