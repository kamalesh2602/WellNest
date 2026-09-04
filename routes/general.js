const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// ==========================================
// EXPIRED SLOT CLEANUP HELPER FUNCTIONS
// ==========================================

/**
 * Safely parses a slot's date and time strings into a JavaScript Date object.
 * Supports ISO format (YYYY-MM-DD), slash separators (YYYY/MM/DD or DD/MM/YYYY), and standard time strings (HH:mm).
 * @param {string} slotDate - Date string from slot document
 * @param {string} slotTime - Time string from slot document
 * @returns {Date|null} - JavaScript Date object representing local slot date & time, or null if invalid
 */
function parseSlotDateTime(slotDate, slotTime) {
    if (!slotDate || !slotTime) return null;

    const trimmedDate = String(slotDate).trim();
    const trimmedTime = String(slotTime).trim();

    // 1. Standard ISO date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        const timeParts = trimmedTime.split(':');
        const hh = (timeParts[0] || '00').padStart(2, '0');
        const mm = (timeParts[1] || '00').padStart(2, '0');
        const ss = (timeParts[2] || '00').padStart(2, '0');
        const dt = new Date(`${trimmedDate}T${hh}:${mm}:${ss}`);
        if (!isNaN(dt.getTime())) return dt;
    }

    // 2. Slash-separated dates (YYYY/MM/DD or DD/MM/YYYY)
    if (trimmedDate.includes('/')) {
        const parts = trimmedDate.split('/');
        if (parts.length === 3) {
            let year, month, day;
            if (parts[0].length === 4) {
                // YYYY/MM/DD
                [year, month, day] = parts;
            } else if (parts[2].length === 4) {
                // DD/MM/YYYY
                [day, month, year] = parts;
            }
            if (year && month && day) {
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const timeParts = trimmedTime.split(':');
                const hh = (timeParts[0] || '00').padStart(2, '0');
                const mm = (timeParts[1] || '00').padStart(2, '0');
                const ss = (timeParts[2] || '00').padStart(2, '0');
                const dt = new Date(`${formattedDate}T${hh}:${mm}:${ss}`);
                if (!isNaN(dt.getTime())) return dt;
            }
        }
    }

    // 3. Fallback space-separated parsing
    const fallback = new Date(`${trimmedDate} ${trimmedTime}`);
    if (!isNaN(fallback.getTime())) {
        return fallback;
    }

    return null;
}

/**
 * Checks if a slot's date and time has passed current server time.
 * @param {string} slotDate 
 * @param {string} slotTime 
 * @returns {boolean} true if slot is expired (past), false otherwise
 */
function isSlotExpired(slotDate, slotTime) {
    const slotDateTime = parseSlotDateTime(slotDate, slotTime);
    if (!slotDateTime) {
        // If date/time cannot be parsed, do not expire automatically to avoid accidental deletion
        return false;
    }
    return slotDateTime.getTime() <= Date.now();
}

// Get all available slots (with automatic cleanup of expired slots)
router.get('/getslots', async (req, res) => {
    try {
        const slots = await Slot.find({});

        // -------------------------------------------------------------
        // EXPIRED SLOT CLEANUP LOGIC
        // Filter out slots whose scheduled date and time have passed.
        // Delete expired slots from MongoDB to prevent accumulation.
        // -------------------------------------------------------------
        const validSlots = [];
        const expiredSlotIds = [];

        for (const slot of slots) {
            if (isSlotExpired(slot.slotDate, slot.slotTime)) {
                expiredSlotIds.push(slot._id);
            } else {
                validSlots.push(slot);
            }
        }

        // Delete expired slots from database
        if (expiredSlotIds.length > 0) {
            await Slot.deleteMany({ _id: { $in: expiredSlotIds } });
            console.log(`🧹 Cleaned up ${expiredSlotIds.length} expired counselling slot(s) from MongoDB.`);
        }

        console.log("✅ Slots retrieved from DB (valid future slots):", validSlots);
        res.status(200).json(validSlots);
    } catch (err) {
        console.error('Error fetching slots:', err);
        res.status(500).json({ message: 'Failed to fetch slots' });
    }
});

// Book a slot (with concurrency safety & expired slot check)
router.post('/bookslot', async (req, res) => {
    try {
        const { userId, userName, counsellorName, counsellorEmail, counsellorType, date, time, slotId } = req.body;

        console.log("✅ Received Booking Request:", req.body);

        if (!userId || !userName || !counsellorName || !counsellorEmail || !date || !time || !slotId) {
            return res.status(400).json({ message: 'All fields are required, including slot ID.' });
        }

        // -------------------------------------------------------------
        // EXPIRED SLOT BOOKING PROTECTION
        // Verify if slot exists and whether it has expired before booking.
        // If expired, delete it from MongoDB and reject the booking attempt.
        // -------------------------------------------------------------
        const slot = await Slot.findById(slotId);
        if (!slot) {
            return res.status(400).json({ message: 'This slot is no longer available. It may have just been booked by someone else.' });
        }

        if (isSlotExpired(slot.slotDate, slot.slotTime)) {
            // Delete expired slot from MongoDB
            await Slot.findByIdAndDelete(slotId);
            return res.status(400).json({ message: 'This counselling slot has expired.' });
        }

        // Concurrency Lock: Atomically find and delete the slot first.
        const deletedSlot = await Slot.findByIdAndDelete(slotId);
        if (!deletedSlot) {
            return res.status(400).json({ message: 'This slot is no longer available. It may have just been booked by someone else.' });
        }

        const newBooking = new Booking({
            userId,
            userName: userName.trim(),
            counsellorName: counsellorName.trim(),
            counsellorEmail: counsellorEmail.trim().toLowerCase(),
            counsellorType: counsellorType.trim(),
            date,
            time
        });

        await newBooking.save();

        res.status(200).json({ message: 'Booking successful!', booking: newBooking });
    } catch (err) {
        console.error('Error booking slot:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This slot is already booked.' });
        }
        res.status(500).json({ message: 'Booking failed, please try again later' });
    }
});

const mongoose = require('mongoose');

// Get bookings for a user
router.get('/getbookings', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        const bookings = await Booking.find({ userId });
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching user bookings:', err);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// Send meeting link (Start Consultation)
router.post('/send-meeting-link', async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Valid Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
        const meetingLink = `https://${jitsiDomain}/WellNest-${booking._id}`;
        booking.meetingLink = meetingLink;
        await booking.save();

        res.status(200).json({ message: 'Meeting started successfully.', meetingLink });

        // Auto-delete the booking 10 minutes after scheduled consultation time
        const scheduledDateTime = new Date(`${booking.date} ${booking.time}`);
        if (!isNaN(scheduledDateTime)) {
            const deletionTime = scheduledDateTime.getTime() + 10 * 60 * 1000; // 10 minutes after
            const delay = deletionTime - Date.now();

            if (delay > 0) {
                setTimeout(async () => {
                    try {
                        await Booking.findByIdAndDelete(bookingId);
                        console.log(`⏳ Booking ${bookingId} auto-deleted 10 minutes after scheduled time.`);
                    } catch (deleteError) {
                        console.error(`🚨 Error auto-deleting booking ${bookingId}:`, deleteError);
                    }
                }, delay);
            } else {
                console.log(`🚨 Booking ${bookingId} is already past the auto-deletion window.`);
            }
        }
    } catch (err) {
        console.error('Error starting meeting:', err);
        res.status(500).json({ message: 'Server error starting meeting.' });
    }
});

// Client Configuration Endpoint — returns all public runtime config to the frontend
router.get('/config', (req, res) => {
    res.json({
        API_BASE_URL: process.env.API_BASE_URL || '',
        JITSI_DOMAIN: process.env.JITSI_DOMAIN || 'meet.jit.si'
    });
});


module.exports = router;
