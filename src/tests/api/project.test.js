const request = require('supertest');
const app = require('../../index');
const { getAuthToken } = require('../utils/testUtils');

describe('Projects API', () => {
  let homeownerToken;

  beforeAll(() => {
    homeownerToken = getAuthToken('homeowner-1', ['HOMEOWNER']);
  });

  describe('POST /api/projects/create', () => {
    test('should create a project', async () => {
      const res = await request(app)
        .post('/api/projects/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          title: 'Bathroom Remodel',
          description: 'Full bathroom renovation',
          budget: 8000,
          startDate: '2025-09-01',
          endDate: '2025-10-30',
          address: '25 Salako Str'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.project).toHaveProperty('id');
    });

    test('should reject invalid budget', async () => {
      const res = await request(app)
        .post('/api/projects/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          title: 'Invalid Project',
          description: 'Test',
          budget: -100,
          startDate: '2025-07-01',
          endDate: '2025-08-31',
          address: '25 Salako Str'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/projects/:id', () => {
    test('should get project details', async () => {
      const res = await request(app)
        .get('/api/projects/project-1')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.project.id).toBe('project-1');
    });

    test('should reject unauthorized access', async () => {
      const otherUserToken = getAuthToken('other-user', ['CONTRACTOR']);
      const res = await request(app)
        .get('/api/projects/project-1')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});