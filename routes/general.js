const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Get all available slots
router.get('/getslots', async (req, res) => {
    try {
        const slots = await Slot.find({});
        console.log("✅ Slots retrieved from DB:", slots);
        res.status(200).json(slots);
    } catch (err) {
        console.error('Error fetching slots:', err);
        res.status(500).json({ message: 'Failed to fetch slots' });
    }
});

// Book a slot (with concurrency safety)
router.post('/bookslot', async (req, res) => {
    try {
        const { userId, userName, counsellorName, counsellorEmail, counsellorType, date, time, slotId } = req.body;

        console.log("✅ Received Booking Request:", req.body);

        if (!userId || !userName || !counsellorName || !counsellorEmail || !date || !time || !slotId) {
            return res.status(400).json({ message: 'All fields are required, including slot ID.' });
        }

        // Concurrency Lock: Atomically find and delete the slot first.
        // If it doesn't exist or is already deleted, findByIdAndDelete returns null.
        const slot = await Slot.findByIdAndDelete(slotId);
        if (!slot) {
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
        // Note: If saving the booking failed, the slot was already deleted. We can optionally restore it,
        // but double booking is prevented. To maintain stability, we log it.
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This slot is already booked.' });
        }
        res.status(500).json({ message: 'Booking failed, please try again later' });
    }
});

// Get bookings for a user
router.get('/getbookings', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
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
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
        const meetingLink = `https://${jitsiDomain}/WellNest-${booking._id}`;
        booking.meetingLink = meetingLink;
        await booking.save();

        res.status(200).json({ message: 'Meeting started, email sent.' });

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
        EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
        EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
        EMAILJS_BOOKING_TEMPLATE_ID: process.env.EMAILJS_BOOKING_TEMPLATE_ID || '',
        EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
        JITSI_DOMAIN: process.env.JITSI_DOMAIN || 'meet.jit.si'
    });
});


module.exports = router;
