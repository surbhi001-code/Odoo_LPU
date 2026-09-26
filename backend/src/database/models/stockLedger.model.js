const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const StockLedger = sequelize.define('StockLedger', {
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
    change_qty: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
    },
    balance_after: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
    },
    document_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    document_type: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'stock_ledger',
    timestamps: true,
    underscored: true,
    updatedAt: false // append-only, never updated
});

module.exports = StockLedger;