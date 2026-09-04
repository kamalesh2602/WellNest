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

/**
 * Safely parses slotDate and slotTime and checks if it is in the past.
 */
function isSlotInPast(slotDate, slotTime) {
    if (!slotDate || !slotTime) return true;

    const trimmedDate = String(slotDate).trim();
    const trimmedTime = String(slotTime).trim();

    let slotDateTime = null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        const timeParts = trimmedTime.split(':');
        const hh = (timeParts[0] || '00').padStart(2, '0');
        const mm = (timeParts[1] || '00').padStart(2, '0');
        const ss = (timeParts[2] || '00').padStart(2, '0');
        slotDateTime = new Date(`${trimmedDate}T${hh}:${mm}:${ss}`);
    } else if (trimmedDate.includes('/')) {
        const parts = trimmedDate.split('/');
        if (parts.length === 3) {
            let year, month, day;
            if (parts[0].length === 4) [year, month, day] = parts;
            else if (parts[2].length === 4) [day, month, year] = parts;
            if (year && month && day) {
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const timeParts = trimmedTime.split(':');
                const hh = (timeParts[0] || '00').padStart(2, '0');
                const mm = (timeParts[1] || '00').padStart(2, '0');
                const ss = (timeParts[2] || '00').padStart(2, '0');
                slotDateTime = new Date(`${formattedDate}T${hh}:${mm}:${ss}`);
            }
        }
    }

    if (!slotDateTime || isNaN(slotDateTime.getTime())) {
        slotDateTime = new Date(`${trimmedDate} ${trimmedTime}`);
    }

    if (!slotDateTime || isNaN(slotDateTime.getTime())) {
        return true; // Invalid date/time format
    }

    return slotDateTime.getTime() <= Date.now();
}

// Counsellor Add Slot
router.post('/addslot', async (req, res) => {
    try {
        const { counsellorName, counsellorEmail, counsellorType, slotDate, slotTime } = req.body;

        if (!counsellorName || !counsellorEmail || !counsellorType || !slotDate || !slotTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate that slot is not in the past
        if (isSlotInPast(slotDate, slotTime)) {
            return res.status(400).json({ message: 'Cannot create a slot in the past. Please select a future date and time.' });
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
