const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'),
        allowNull: false
    },
    reference_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'),
        allowNull: false,
        defaultValue: 'DRAFT'
    },
    source_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    destination_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    partner_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    validated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    validated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['type', 'status'] }
    ]
});

module.exports = Document;