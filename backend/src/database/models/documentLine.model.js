const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const DocumentLine = sequelize.define('DocumentLine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    document_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
    }
}, {
    tableName: 'document_lines',
    timestamps: true,
    underscored: true
});

module.exports = DocumentLine;