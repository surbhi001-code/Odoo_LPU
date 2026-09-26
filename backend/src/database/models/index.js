const sequelize = require('../../config/db');

const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Warehouse = require('./warehouse.model');
const Location = require('./location.model');
const Inventory = require('./inventory.model');
const Document = require('./document.model');
const DocumentLine = require('./documentLine.model');
const StockLedger = require('./stockLedger.model');

// Category → Product
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Warehouse → Location
Warehouse.hasMany(Location, { foreignKey: 'warehouse_id' });
Location.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

// Inventory (Product + Location composite)
Product.hasMany(Inventory, { foreignKey: 'product_id' });
Inventory.belongsTo(Product, { foreignKey: 'product_id' });
Location.hasMany(Inventory, { foreignKey: 'location_id' });
Inventory.belongsTo(Location, { foreignKey: 'location_id' });

// Document → source/destination Locations
Document.belongsTo(Location, { as: 'sourceLocation', foreignKey: 'source_location_id' });
Document.belongsTo(Location, { as: 'destinationLocation', foreignKey: 'destination_location_id' });

// Document → created_by / validated_by Users
Document.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Document.belongsTo(User, { as: 'validator', foreignKey: 'validated_by' });

// Document → DocumentLine
Document.hasMany(DocumentLine, { foreignKey: 'document_id', as: 'lines' });
DocumentLine.belongsTo(Document, { foreignKey: 'document_id' });
Product.hasMany(DocumentLine, { foreignKey: 'product_id' });
DocumentLine.belongsTo(Product, { foreignKey: 'product_id' });

// StockLedger relations
Product.hasMany(StockLedger, { foreignKey: 'product_id' });
StockLedger.belongsTo(Product, { foreignKey: 'product_id' });
Location.hasMany(StockLedger, { foreignKey: 'location_id' });
StockLedger.belongsTo(Location, { foreignKey: 'location_id' });
Document.hasMany(StockLedger, { foreignKey: 'document_id' });
StockLedger.belongsTo(Document, { foreignKey: 'document_id' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Warehouse,
    Location,
    Inventory,
    Document,
    DocumentLine,
    StockLedger
};