const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

describe('User Authentication API', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    describe('POST /submit (Signup)', () => {
        it('should successfully register a user with valid data', async () => {
            const res = await request(app)
                .post('/submit')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    phno: '9876543210',
                    aadhar: '123456789012',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Signup successful');
            expect(res.body.user).toHaveProperty('name', 'Test User');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should reject signup when required fields are missing', async () => {
            const res = await request(app)
                .post('/submit')
                .send({
                    name: 'Incomplete User',
                    email: 'incomplete@example.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('All fields are required');
        });

        it('should reject signup with duplicate email', async () => {
            const userData = {
                name: 'First User',
                email: 'duplicate@example.com',
                phno: '9876543210',
                aadhar: '123456789012',
                password: 'password123'
            };

            await request(app).post('/submit').send(userData);

            const res = await request(app)
                .post('/submit')
                .send({
                    ...userData,
                    name: 'Second User',
                    aadhar: '987654321098'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email already exists');
        });
    });

    describe('POST /login (Login)', () => {
        beforeEach(async () => {
            await request(app)
                .post('/submit')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    phno: '9876543210',
                    aadhar: '123456789012',
                    password: 'password123'
                });
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    nameemail: 'login@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Login successful');
            expect(res.body.user).toHaveProperty('email', 'login@example.com');
        });

        it('should reject login with invalid password', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    nameemail: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login when credentials are missing', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    nameemail: ''
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Name/Email and password are required');
        });
    });
});
