const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    aadhar: {
        type: Number,
        required: [true, 'Aadhar number is required'],
        unique: true
    },
    phno: {
        type: Number,
        required: [true, 'Phone number is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('User', userSchema);
