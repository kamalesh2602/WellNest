const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

describe('Rate Limiting & Request Logging Middleware', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await closeTestDB();
    });

    describe('Normal API Operations', () => {
        it('should allow normal GET requests to public config endpoint', async () => {
            const res = await request(app).get('/config');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('JITSI_DOMAIN');
        });

        it('should allow auth requests under normal usage threshold', async () => {
            const res = await request(app)
                .post('/login')
                .send({ nameemail: 'invalid@example.com', password: 'wrong' });
            
            // Should get 400 (Invalid credentials / User not found), not 429
            expect(res.statusCode).toBe(400);
            expect(res.body.message).not.toBe('Too many requests. Please try again later.');
        });
    });

    describe('Authentication Endpoint Rate Limiting', () => {
        it('should return HTTP 429 when authentication rate limit is exceeded', async () => {
            const testIpHeader = 'x-test-rate-limit';

            // Send 20 requests (the allowed threshold for auth endpoints)
            for (let i = 0; i < 20; i++) {
                await request(app)
                    .post('/login')
                    .set(testIpHeader, 'true')
                    .send({ nameemail: 'test@example.com', password: 'test' });
            }

            // The 21st request should exceed the limit and receive HTTP 429
            const res = await request(app)
                .post('/login')
                .set(testIpHeader, 'true')
                .send({ nameemail: 'test@example.com', password: 'test' });

            expect(res.statusCode).toBe(429);
            expect(res.body).toEqual({
                message: 'Too many requests. Please try again later.'
            });
        });
    });

    describe('Morgan Request Logging Compatibility', () => {
        it('should log requests without interfering with JSON response structure', async () => {
            const res = await request(app).get('/config');
            expect(res.statusCode).toBe(200);
            expect(typeof res.body).toBe('object');
        });
    });
});
