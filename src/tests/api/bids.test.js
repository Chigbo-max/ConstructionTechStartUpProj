const request = require('supertest');
const app = require('../../index');
const { getAuthToken } = require('../utils/testUtils');

describe('Bids API', () => {
  let homeownerToken;
  let contractorToken;

  beforeAll(() => {
    homeownerToken = getAuthToken('homeowner-1', ['HOMEOWNER']);
    contractorToken = getAuthToken('contractor-1', ['CONTRACTOR']);
  });

  describe('POST /api/bids/create', () => {
    test('should submit a bid', async () => {
      const res = await request(app)
        .post('/api/bids/create')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          projectId: 'project-1',
          amount: 9500,
          proposal: 'Quality work guaranteed',
          estimatedDuration: 45,
          estimatedStartDate: '2025-09-01',
          estimatedEndDate: '2025-09-25'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.bid).toHaveProperty('id');
    });

    test('should reject duplicate bids', async () => {
      const projectRes = await request(app)
        .post('/api/projects/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          title: 'Test Project for Duplicate Bids',
          description: 'A test project to verify duplicate bid rejection',
          budget: 5000,
          startDate: '2025-09-01',
          endDate: '2025-10-01',
          address: '123 Test Street'
        });
      expect(projectRes.statusCode).toBe(201);
      
      await request(app)
        .patch('/api/projects/publish')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          projectId: projectRes.body.project.id,
          bidsCloseAt: '2025-10-31'
        });

      await request(app)
        .post('/api/bids/create')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          projectId: projectRes.body.project.id,
          amount: 9000,
          proposal: 'Another bid',
          estimatedDuration: 30,
          estimatedStartDate: '2025-09-01',
          estimatedEndDate: '2025-09-25'
        });

      const res = await request(app)
        .post('/api/bids/create')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          projectId: projectRes.body.project.id,
          amount: 9000,
          proposal: 'Duplicate bid',
          estimatedDuration: 30,
          estimatedStartDate: '2025-09-01',
          estimatedEndDate: '2025-09-25'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/bids/assign', () => {
    test('should assign a bid', async () => {
      const projectRes = await request(app)
        .post('/api/projects/create')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          title: 'Test Project for Bid Assignment',
          description: 'A test project to verify bid assignment',
          budget: 5000,
          startDate: '2025-09-01',
          endDate: '2025-10-01',
          address: '456 Test Street'
        });
      expect(projectRes.statusCode).toBe(201);
      
      await request(app)
        .patch('/api/projects/publish')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          projectId: projectRes.body.project.id,
          bidsCloseAt: '2025-10-31'
        });

      const bidRes = await request(app)
        .post('/api/bids/create')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          projectId: projectRes.body.project.id,
          amount: 8500,
          proposal: 'Test bid to assign',
          estimatedDuration: 30,
          estimatedStartDate: '2025-09-01',
          estimatedEndDate: '2025-09-25'
        });

      expect(bidRes.statusCode).toBe(201);
      expect(bidRes.body.bid).toHaveProperty('id');

      const res = await request(app)
        .post('/api/bids/assign')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          projectId: projectRes.body.project.id,
          bidId: bidRes.body.bid.id
        });

      expect(res.statusCode).toBe(200);
    });
  });
});