require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const counsellorRoutes = require('./routes/counsellor');
const generalRoutes = require('./routes/general');

const app = express();

// Connect to Database
connectDB();

// CORS Settings
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'https://wellnestadl.netlify.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5500' // VS Code Live Server
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes Mounting
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/counsellor', counsellorRoutes);
app.use('/', generalRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🚨 Error details:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
