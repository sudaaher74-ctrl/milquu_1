import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// We create a mini Express app here to test the middlewares directly
// This avoids needing to connect to the real MongoDB in tests
const app = express();
app.use(helmet());
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 2 });
app.use('/api/limited', apiLimiter, (req, res) => res.json({ success: true }));
app.get('/health', (req, res) => res.json({ status: 'UP' }));

describe('API Security and Health Integration Tests', () => {
  it('Should return 200 OK on health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('Should have security headers (Helmet)', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-dns-prefetch-control']).toEqual('off');
    expect(res.headers['x-frame-options']).toEqual('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('Should enforce rate limiting on specific endpoints', async () => {
    // 1st request - should pass
    await request(app).get('/api/limited');
    // 2nd request - should pass
    const res2 = await request(app).get('/api/limited');
    expect(res2.statusCode).toEqual(200);
    // 3rd request - should be rate limited (429 Too Many Requests)
    const res3 = await request(app).get('/api/limited');
    expect(res3.statusCode).toEqual(429);
  });
});
