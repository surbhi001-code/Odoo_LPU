const { Op } = require('sequelize');
const { Product, Inventory, Document } = require('../../database/models');
const stockService = require('../stock/stock.service');

const getKpis = async () => {
    // Total Products in Stock — count of active products (not sum of quantity; "products in stock" = distinct SKUs tracked)
    const totalProducts = await Product.count({ where: { is_active: true } });

    // Low/Out of Stock — reuses the same logic stock module already exposes
    const lowStockProducts = await stockService.getLowStockProducts();
    const outOfStockCount = lowStockProducts.filter((p) => p.totalStock <= 0).length;
    const lowStockCount = lowStockProducts.filter((p) => p.totalStock > 0).length;

    // Pending = anything not yet DONE or CANCELED
    const pendingStatuses = { [Op.in]: ['DRAFT', 'WAITING', 'READY'] };

    const pendingReceipts = await Document.count({ where: { type: 'RECEIPT', status: pendingStatuses } });
    const pendingDeliveries = await Document.count({ where: { type: 'DELIVERY', status: pendingStatuses } });
    const transfersScheduled = await Document.count({ where: { type: 'TRANSFER', status: pendingStatuses } });

    return {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        transfersScheduled
    };
};

// Powers the dashboard's own filtered document list (mirrors operations' filtering, kept here
// so the dashboard view doesn't need to hit a second module for its filter row)
const getFilteredDocuments = async ({ type, status, warehouse_id, category_id, page = 1, limit = 20 }) => {
    
    const operationService = require('../operations/operation.service');
    return operationService.getAllDocuments({ type, status, warehouse_id, category_id, page, limit });
};

module.exports = { getKpis, getFilteredDocuments };