const request = require('supertest');
const app = require('../app');
const Counsellor = require('../models/Counsellor');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

describe('Counsellor Authentication API', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    describe('POST /counsellor/login', () => {
        beforeEach(async () => {
            const counsellor = new Counsellor({
                name: 'Dr. Smith',
                email: 'smith@wellnest.com',
                ctype: 'Psychologist',
                password: 'counsellor123'
            });
            await counsellor.save();
        });

        it('should login successfully with valid counsellor credentials', async () => {
            const res = await request(app)
                .post('/counsellor/login')
                .send({
                    email: 'smith@wellnest.com',
                    password: 'counsellor123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Login successful');
            expect(res.body.user).toHaveProperty('email', 'smith@wellnest.com');
            expect(res.body.user).toHaveProperty('ctype', 'Psychologist');
        });

        it('should reject login with incorrect password', async () => {
            const res = await request(app)
                .post('/counsellor/login')
                .send({
                    email: 'smith@wellnest.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login when required fields are missing', async () => {
            const res = await request(app)
                .post('/counsellor/login')
                .send({
                    email: 'smith@wellnest.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email and password are required');
        });
    });
});
