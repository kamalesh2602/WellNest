const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
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
    slotDate: {
        type: String,
        required: [true, 'Slot date is required']
    },
    slotTime: {
        type: String,
        required: [true, 'Slot time is required']
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate slots for the same counsellor at same date/time
slotSchema.index({ counsellorEmail: 1, slotDate: 1, slotTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
