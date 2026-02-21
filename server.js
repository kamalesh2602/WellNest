require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');




const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Connect to MongoDB (Remove deprecated options)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    aadhar: { type: Number, unique: true, required: true },
    phno: { type: Number, required: true },
    password: { type: String, required: true }
});


const User = mongoose.model('User', userSchema);

const counsellorDetailsSchema = new mongoose.Schema({
    name: String,
    email: String,
    ctype: String,
    password: String
});
const Counsellor = mongoose.model('Counsellor', counsellorDetailsSchema);



const slotschema = new mongoose.Schema({
    name: String,
    email: String,
    ctype: String,
    date: String,
    time: String
});


const Slots = mongoose.model('Slots', slotschema);

const slotSchema = new mongoose.Schema({
    counsellorName: { type: String, required: true },
    counsellorEmail: { type: String, required: true },
    counsellorType: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
});

const Slot = mongoose.model('Slot', slotSchema);

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    counsellorName: { type: String },
    counsellorEmail: { type: String },
    counsellorType: { type: String },
    userName: { type: String },
    date: { type: String },
    time: { type: String },
    meetingLink: { type: String }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/submit', async (req, res) => {
    try {
        const { name, email, phno, aadhar, password } = req.body;

        if (!name || !email || !phno || !aadhar || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            phno: Number(phno),  // Ensure it's a number
            aadhar: Number(aadhar),  // Ensure it's a number
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'Signup successful', user: { name, email } });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { nameemail, password } = req.body;

        // Find user by either email or name
        const user = await User.findOne({
            $or: [{ email: nameemail }, { name: nameemail }]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare entered password with hashed password
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




app.post('/bookslot', async (req, res) => {
    try {
        const { userId, userName, counsellorName, counsellorEmail, counsellorType, date, time, slotId } = req.body;

        console.log("✅ Received Booking Data:", req.body); // Debugging to ensure all fields exist

        if (!userId || !userName || !counsellorName || !counsellorEmail || !date || !time) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newBooking = new Booking({
            userId,
            userName,
            counsellorName,
            counsellorEmail,
            counsellorType,
            date,
            time
        });

        await newBooking.save();
        await Slots.findByIdAndDelete(slotId);

        res.status(200).json({ message: 'Booking successful!', booking: newBooking });

    } catch (err) {
        console.error('Error booking slot:', err);
        res.status(500).json({ message: 'Booking failed, please try again later' });
    }
});



app.get('/getslots', async (req, res) => {
    try {
        const slots = await Slots.find({});

        console.log("✅ Slots retrieved from DB:", slots); // Debugging log

        res.status(200).json(slots);
    } catch (err) {
        console.error('Error fetching slots:', err);
        res.status(500).json({ message: 'Failed to fetch slots' });
    }
});




app.get('/getbookings', async (req, res) => {
    try {
        const userId = req.query.userId; // Ensure userId is passed as a query parameter
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const bookings = await Booking.find({ userId }); // Filter by userId
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});



app.post('/send-meeting-link', async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const meetingLink = `https://meet.jit.si/WellNest-${booking._id}`;
        booking.meetingLink = meetingLink; // Store the meeting link in the booking document
        await booking.save(); // Save the meeting link

        res.status(200).json({ message: 'Meeting started, email sent.' });

        // Calculate deletion time (10 minutes after the scheduled date and time)
        const scheduledDateTime = new Date(`${booking.date} ${booking.time}`);
        const deletionTime = scheduledDateTime.getTime() + 10 * 60 * 1000; // 10 minutes extra

        const delay = deletionTime - Date.now(); // Time remaining until deletion

        if (delay > 0) {
            setTimeout(async () => {
                try {
                    await Booking.findByIdAndDelete(bookingId);
                    console.log(`⏳ Booking ${bookingId} deleted 10 minutes after the scheduled time.`);
                } catch (deleteError) {
                    console.error(`🚨 Error deleting booking ${bookingId}:`, deleteError);
                }
            }, delay);
        } else {
            console.log(`🚨 Booking ${bookingId} should have already been deleted.`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ message: 'Server error starting meeting.' });
    }
});







//admin
app.post('/admin/submit', async (req, res) => {
    try {
        const { name, email, ctype, password } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newCounsellor = new Counsellor({
            name,
            email,
            ctype,
            password
        });

        await newCounsellor.save();
        res.status(201).json({ message: 'Counsellor slot added successfully' });
    } catch (err) {
        console.error('Error saving counsellor slot:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/admin/counsellors', async (req, res) => {
    try {
        const counsellors = await Counsellor.find();
        res.json(counsellors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete counsellor
app.delete('/admin/counsellors/:id', async (req, res) => {
    try {
        await Counsellor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Counsellor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete('/admin/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//counsellor

app.post('/counsellor/login', async (req, res) => {
    try {
        const { name, email, ctype,password } = req.body;

        // Find counsellor by either name OR email
        const counsellor = await Counsellor.findOne({email});

        if (!counsellor) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare entered password directly (not recommended for production)
        if (password !== counsellor.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: { id: counsellor._id, name: counsellor.name, email: counsellor.email,ctype: counsellor.ctype }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/counsellor/addslot', async (req, res) => {
    try {
        const { counsellorName, counsellorEmail,counsellorType, slotDate, slotTime } = req.body;

        if (!counsellorName || !counsellorEmail || !counsellorType || !slotDate || !slotTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newSlot = new Slot({ counsellorName, counsellorEmail, counsellorType, slotDate, slotTime });
        await newSlot.save();

        res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
    } catch (err) {
        console.error('Error storing slot:', err);
        res.status(500).json({ message: 'Failed to create slot' });
    }
});

app.get('/counsellor/getbookings', async (req, res) => {
    try {
        const { counsellorEmail } = req.query;

        if (!counsellorEmail) {
            return res.status(400).json({ message: 'Counsellor email is required' });
        }

        const bookings = await Booking.find({ counsellorEmail });
        console.log("📌 Bookings fetched:", bookings); // Debugging

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' }); // Make sure response is consistent
        }

        res.status(200).json({ success: true, data: bookings });

    } catch (error) {
        console.error('🚨 Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`🚀 Server running on port  http://localhost:${PORT}`));
