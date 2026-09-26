const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unit_of_measure: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pcs'
    },
    reorder_point: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    reorder_qty: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['sku'] }
    ]
});

module.exports = Product;