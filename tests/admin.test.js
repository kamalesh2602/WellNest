const request = require('supertest');
const app = require('../app');

describe('Admin Authentication API', () => {
    const TEST_ADMIN_SECRET = 'test_admin_secret_key_123';

    beforeAll(() => {
        process.env.ADMIN_SECRET = TEST_ADMIN_SECRET;
    });

    describe('POST /admin/login', () => {
        it('should login successfully with correct ADMIN_SECRET', async () => {
            const res = await request(app)
                .post('/admin/login')
                .send({ secret: TEST_ADMIN_SECRET });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Login successful');
        });

        it('should reject login with incorrect ADMIN_SECRET', async () => {
            const res = await request(app)
                .post('/admin/login')
                .send({ secret: 'wrong_secret' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid Admin credentials');
        });
    });
});
