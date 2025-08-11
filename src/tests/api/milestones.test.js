const request = require('supertest');
const app = require('../../index');
const { getAuthToken } = require('../utils/testUtils');

describe('Milestones API', () => {
  let homeownerToken;

  beforeAll(() => {
    homeownerToken = getAuthToken('homeowner-1', ['HOMEOWNER']);
  });

  describe('POST /api/milestones/create', () => {
    test('should create a milestone', async () => {
      const res = await request(app)
        .post('/api/milestones/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          projectId: 'project-1',
          title: 'Demolition Complete',
          description: 'Remove all old fixtures',
          dueDate: '2023-07-15'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.milestone).toHaveProperty('id');
    });

    test('should reject missing due date', async () => {
      const res = await request(app)
        .post('/api/milestones/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          projectId: 'project-1',
          title: 'Invalid Milestone',
          description: 'Missing due date'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});