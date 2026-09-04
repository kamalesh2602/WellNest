const request = require('supertest');
const app = require('../app');
const Slot = require('../models/Slot');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

describe('Slot Management API', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    describe('POST /counsellor/addslot', () => {
        it('should successfully create a valid future slot', async () => {
            const res = await request(app)
                .post('/counsellor/addslot')
                .send({
                    counsellorName: 'Dr. Jane',
                    counsellorEmail: 'jane@wellnest.com',
                    counsellorType: 'Psychiatrist',
                    slotDate: '2099-12-31',
                    slotTime: '14:00'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Slot created successfully');
            expect(res.body.slot).toHaveProperty('counsellorEmail', 'jane@wellnest.com');
        });

        it('should reject creating a slot with missing data', async () => {
            const res = await request(app)
                .post('/counsellor/addslot')
                .send({
                    counsellorName: 'Dr. Jane',
                    slotDate: '2099-12-31'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('All fields are required');
        });

        it('should reject creating a slot in the past', async () => {
            const res = await request(app)
                .post('/counsellor/addslot')
                .send({
                    counsellorName: 'Dr. Jane',
                    counsellorEmail: 'jane@wellnest.com',
                    counsellorType: 'Psychiatrist',
                    slotDate: '2020-01-01',
                    slotTime: '10:00'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Cannot create a slot in the past');
        });
    });

    describe('GET /getslots', () => {
        it('should return valid future slots and exclude/clean up expired slots', async () => {
            // Future slot
            const futureSlot = new Slot({
                counsellorName: 'Dr. Future',
                counsellorEmail: 'future@wellnest.com',
                counsellorType: 'Therapist',
                slotDate: '2099-12-31',
                slotTime: '15:00'
            });
            await futureSlot.save();

            // Past slot directly saved to DB to simulate an expired slot
            const pastSlot = new Slot({
                counsellorName: 'Dr. Past',
                counsellorEmail: 'past@wellnest.com',
                counsellorType: 'Therapist',
                slotDate: '2020-01-01',
                slotTime: '09:00'
            });
            await pastSlot.save();

            const res = await request(app).get('/getslots');

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].counsellorEmail).toBe('future@wellnest.com');

            // Verify expired slot was cleaned up from database
            const remainingSlotsInDB = await Slot.find({});
            expect(remainingSlotsInDB.length).toBe(1);
            expect(remainingSlotsInDB[0].counsellorEmail).toBe('future@wellnest.com');
        });
    });
});
