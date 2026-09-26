const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const routes = require('./routes');
const app = express();

// core middleware
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));
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
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;