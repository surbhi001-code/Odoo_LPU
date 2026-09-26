const stockService = require('./stock.service');

const getInventoryBalance = async (req, res, next) => {
    try {
        const result = await stockService.getInventoryBalance(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getLedger = async (req, res, next) => {
    try {
        const result = await stockService.getLedger(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getLowStockProducts = async (req, res, next) => {
    try {
        const products = await stockService.getLowStockProducts();
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
};

module.exports = { getInventoryBalance, getLedger, getLowStockProducts };