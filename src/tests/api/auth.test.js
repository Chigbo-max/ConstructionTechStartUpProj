const request = require('supertest');
const app = require('../../index');
const { getAuthToken } = require('../utils/testUtils');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new homeowner', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'marybruce@gmail.com',
          password: 'password',
          firstName: 'Mary',
          lastName: 'Bruce',
          roles: ['HOMEOWNER']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    test('should reject invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          roles: ['INVALID_ROLE']
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'marybruce@gmail.com',
          password: 'password'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'homeowner@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});