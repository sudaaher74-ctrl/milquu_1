// The per-IP limit must not lock out a shop full of staff behind one IP, and
// must not count the browser's CORS preflights against customers.

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { globalLimiter, isTrustedStaffRequest } from '../middleware/rateLimiters.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-'.padEnd(64, 'x');

const app = express();
app.use('/api', globalLimiter);
app.all('/api/ping', (req, res) => res.sendStatus(204));

const tokenFor = (role) => `Bearer ${jwt.sign({ id: 'x', role }, process.env.JWT_SECRET)}`;

describe('global rate limit', () => {
  it('trusts signed-in staff and delivery tokens, not customers or forgeries', () => {
    expect(isTrustedStaffRequest({ headers: { authorization: tokenFor('staff') } })).toBe(true);
    expect(isTrustedStaffRequest({ headers: { authorization: tokenFor('delivery') } })).toBe(true);
    expect(isTrustedStaffRequest({ headers: { authorization: tokenFor('user') } })).toBe(false);
    const forged = `Bearer ${jwt.sign({ id: 'x', role: 'admin' }, 'some-other-secret')}`;
    expect(isTrustedStaffRequest({ headers: { authorization: forged } })).toBe(false);
  });

  it('does not count CORS preflights or staff requests', async () => {
    for (let i = 0; i < 1100; i++) {
      await request(app).options('/api/ping');
    }
    const staff = await request(app).get('/api/ping').set('Authorization', tokenFor('manager'));
    expect(staff.statusCode).toBe(204);
    // Preflights left the anonymous allowance untouched
    const anonymous = await request(app).get('/api/ping');
    expect(anonymous.headers['ratelimit-remaining'] ?? anonymous.headers['ratelimit']).toBeDefined();
    expect(anonymous.statusCode).toBe(204);
  }, 60000);
});
