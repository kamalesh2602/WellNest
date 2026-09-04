const express = require('express');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const counsellorRoutes = require('./routes/counsellor');
const generalRoutes = require('./routes/general');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/counsellor', counsellorRoutes);
app.use('/', generalRoutes);

app.use((err, req, res, next) => {
    console.error('🚨 Error details:', err.stack);

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;
