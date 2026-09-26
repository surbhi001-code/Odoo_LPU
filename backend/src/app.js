const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

// core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// health check — confirms server is alive before any modules exist
app.get('/', (req, res) => {
    res.json({ success: true, message: 'StockSense API is running' });
});

app.use('/api/v1', routes);

// 404 handler — catches unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// centralized error handler — always last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;