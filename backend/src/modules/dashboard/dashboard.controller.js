const dashboardService = require('./dashboard.service');

const getKpis = async (req, res, next) => {
    try {
        const kpis = await dashboardService.getKpis();
        res.status(200).json({ success: true, data: kpis });
    } catch (err) {
        next(err);
    }
};

const getFilteredDocuments = async (req, res, next) => {
    try {
        const result = await dashboardService.getFilteredDocuments(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = { getKpis, getFilteredDocuments };