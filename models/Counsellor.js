const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Counsellor name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Counsellor email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    ctype: {
        type: String,
        required: [true, 'Counsellor type is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Counsellor', counsellorSchema);
