const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// User Signup
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phno, aadhar, password } = req.body;

        if (!name || !email || !phno || !aadhar || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingAadhar = await User.findOne({ aadhar: Number(aadhar) });
        if (existingAadhar) {
            return res.status(400).json({ message: 'Aadhar number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phno: Number(phno),
            aadhar: Number(aadhar),
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Signup successful', user: { name: newUser.name, email: newUser.email } });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { nameemail, password } = req.body;

        if (!nameemail || !password) {
            return res.status(400).json({ message: 'Name/Email and password are required' });
        }

        const searchTerm = nameemail.trim();
        const user = await User.findOne({
            $or: [
                { email: searchTerm.toLowerCase() },
                { name: searchTerm }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
