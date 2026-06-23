const express = require('express');
const router = express.Router();
const Counsellor = require('../models/Counsellor');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// Admin login check
router.post('/login', (req, res) => {
    const { secret } = req.body;

    console.log('Received:', JSON.stringify(secret));
    console.log('Expected:', JSON.stringify(process.env.ADMIN_SECRET));

    if (secret === process.env.ADMIN_SECRET) {
        return res.status(200).json({ message: 'Login successful' });
    }

    return res.status(401).json({ message: 'Invalid Admin credentials' });
});

// Protect all following routes with admin auth
router.use(adminAuth);

// Add Counsellor
router.post('/submit', async (req, res) => {
    try {
        const { name, email, ctype, password } = req.body;

        if (!name || !email || !ctype || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingCounsellor = await Counsellor.findOne({ email: email.trim().toLowerCase() });
        if (existingCounsellor) {
            return res.status(400).json({ message: 'Counsellor email already exists' });
        }

        const newCounsellor = new Counsellor({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            ctype: ctype.trim(),
            password: password.trim() // Kept plaintext for compatibility
        });

        await newCounsellor.save();
        res.status(201).json({ message: 'Counsellor added successfully' });
    } catch (err) {
        console.error('Error saving counsellor:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all Counsellors
router.get('/counsellors', async (req, res) => {
    try {
        const counsellors = await Counsellor.find({});
        res.status(200).json(counsellors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Counsellor
router.delete('/counsellors/:id', async (req, res) => {
    try {
        const deleted = await Counsellor.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Counsellor not found' });
        }
        res.status(200).json({ message: 'Counsellor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
