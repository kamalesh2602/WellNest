const express = require('express');
const router = express.Router();
const Counsellor = require('../models/Counsellor');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Counsellor Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const counsellor = await Counsellor.findOne({ email: email.trim().toLowerCase() });

        if (!counsellor) {
            return res.status(400).json({ message: 'Counsellor not found' });
        }

        // Plaintext comparison as per original database compatibility
        if (password !== counsellor.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: { id: counsellor._id, name: counsellor.name, email: counsellor.email, ctype: counsellor.ctype }
        });
    } catch (err) {
        console.error('Counsellor login error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Counsellor Add Slot
router.post('/addslot', async (req, res) => {
    try {
        const { counsellorName, counsellorEmail, counsellorType, slotDate, slotTime } = req.body;

        if (!counsellorName || !counsellorEmail || !counsellorType || !slotDate || !slotTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if counsellor already has a slot at this date and time to prevent duplicates
        const existingSlot = await Slot.findOne({
            counsellorEmail: counsellorEmail.toLowerCase(),
            slotDate,
            slotTime
        });

        if (existingSlot) {
            return res.status(400).json({ message: 'You have already added a slot at this date and time.' });
        }

        const newSlot = new Slot({
            counsellorName: counsellorName.trim(),
            counsellorEmail: counsellorEmail.trim().toLowerCase(),
            counsellorType: counsellorType.trim(),
            slotDate,
            slotTime
        });

        await newSlot.save();
        res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
    } catch (err) {
        console.error('Error storing slot:', err);
        res.status(500).json({ message: 'Failed to create slot' });
    }
});

// Counsellor Get Bookings
router.get('/getbookings', async (req, res) => {
    try {
        const { counsellorEmail } = req.query;

        if (!counsellorEmail) {
            return res.status(400).json({ message: 'Counsellor email is required' });
        }

        const bookings = await Booking.find({ counsellorEmail: counsellorEmail.trim().toLowerCase() });
        console.log("📌 Bookings fetched:", bookings);

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found' });
        }

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});

module.exports = router;
