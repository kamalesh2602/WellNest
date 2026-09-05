const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const counsellorRoutes = require('./routes/counsellor');
const generalRoutes = require('./routes/general');

const app = express();

// Trust proxy for reverse proxy deployment (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging middleware
app.use(morgan('dev'));

// Static files (served before rate limiters so static assets are not rate-limited)
app.use(express.static('public'));

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per window
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true'
});

// Apply general API rate limiter
app.use(apiLimiter);

// Apply strict rate limiter to authentication endpoints
app.post(['/login', '/submit', '/counsellor/login', '/admin/login'], authLimiter);

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/counsellor', counsellorRoutes);
app.use('/', generalRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Error details:', err.stack);

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;

