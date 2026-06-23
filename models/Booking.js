const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    counsellorName: {
        type: String,
        required: [true, 'Counsellor name is required'],
        trim: true
    },
    counsellorEmail: {
        type: String,
        required: [true, 'Counsellor email is required'],
        trim: true,
        lowercase: true
    },
    counsellorType: {
        type: String,
        required: [true, 'Counsellor type is required'],
        trim: true
    },
    date: {
        type: String,
        required: [true, 'Booking date is required']
    },
    time: {
        type: String,
        required: [true, 'Booking time is required']
    },
    meetingLink: {
        type: String
    }
}, {
    timestamps: true
});

// Index userId and counsellorEmail for quick retrieval
bookingSchema.index({ userId: 1 });
bookingSchema.index({ counsellorEmail: 1 });

// Compound unique index to prevent two users from booking the same counsellor at the same date/time
bookingSchema.index({ counsellorEmail: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
