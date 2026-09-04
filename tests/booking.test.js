const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

describe('Booking Functionality API', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    describe('POST /bookslot', () => {
        it('should successfully book a valid future slot', async () => {
            const slot = new Slot({
                counsellorName: 'Dr. Sarah',
                counsellorEmail: 'sarah@wellnest.com',
                counsellorType: 'Psychologist',
                slotDate: '2099-12-31',
                slotTime: '11:00'
            });
            await slot.save();

            const userId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .post('/bookslot')
                .send({
                    userId,
                    userName: 'Alice',
                    counsellorName: 'Dr. Sarah',
                    counsellorEmail: 'sarah@wellnest.com',
                    counsellorType: 'Psychologist',
                    date: '2099-12-31',
                    time: '11:00',
                    slotId: slot._id.toString()
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Booking successful!');
            expect(res.body.booking).toHaveProperty('userName', 'Alice');

            // Verify slot is removed after booking
            const deletedSlot = await Slot.findById(slot._id);
            expect(deletedSlot).toBeNull();
        });

        it('should reject booking an expired slot', async () => {
            const expiredSlot = new Slot({
                counsellorName: 'Dr. Sarah',
                counsellorEmail: 'sarah@wellnest.com',
                counsellorType: 'Psychologist',
                slotDate: '2020-01-01',
                slotTime: '10:00'
            });
            await expiredSlot.save();

            const userId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .post('/bookslot')
                .send({
                    userId,
                    userName: 'Alice',
                    counsellorName: 'Dr. Sarah',
                    counsellorEmail: 'sarah@wellnest.com',
                    counsellorType: 'Psychologist',
                    date: '2020-01-01',
                    time: '10:00',
                    slotId: expiredSlot._id.toString()
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('expired');
        });

        it('should reject booking a slot twice or booking a non-existent slot', async () => {
            const nonExistentSlotId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .post('/bookslot')
                .send({
                    userId: new mongoose.Types.ObjectId().toString(),
                    userName: 'Bob',
                    counsellorName: 'Dr. Sarah',
                    counsellorEmail: 'sarah@wellnest.com',
                    counsellorType: 'Psychologist',
                    date: '2099-12-31',
                    time: '12:00',
                    slotId: nonExistentSlotId
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('no longer available');
        });

        it('should reject booking with missing required data', async () => {
            const res = await request(app)
                .post('/bookslot')
                .send({
                    userName: 'Alice'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('All fields are required');
        });
    });
});
