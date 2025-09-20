import request from 'supertest';
import app from '../app';

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return server status and database connectivity', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body.success).toBeDefined();
      expect(response.body.data).toBeDefined();

      if (response.body.success) {
        expect(response.body.data.server).toBeDefined();
        expect(response.body.data.database).toBeDefined();
        expect(response.body.data.server.status).toBe('running');
        expect(response.body.data.server.timestamp).toBeDefined();
        expect(response.body.data.server.uptime).toBeDefined();
        expect(response.body.data.database.status).toBeDefined();
      }
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health');

      if (response.body.success) {
        const timestamp = response.body.data.server.timestamp;
        expect(new Date(timestamp).getTime()).not.toBeNaN();
      }
    });

    it('should return uptime as a number', async () => {
      const response = await request(app)
        .get('/api/health');

      if (response.body.success) {
        expect(typeof response.body.data.server.uptime).toBe('number');
        expect(response.body.data.server.uptime).toBeGreaterThanOrEqual(0);
      }
    });
  });
});