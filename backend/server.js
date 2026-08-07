import './sentry.js'; // Must be imported before express
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalLimiter, apiLimiter, authLimiter } from './middleware/rateLimiters.js';
import { sanitizeInput } from './middleware/sanitize.js';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import productRoutes from './routes/productRoutes.js';
import { SERVICE_AREAS } from './config/serviceAreas.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import erpRoutes from './routes/erpRoutes.js'; // Added ERP routes
import deliveryRoutes from './routes/deliveryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import freeSampleRoutes from './routes/freeSampleRoutes.js';
import { startScheduler } from './cron/scheduler.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Fail fast if the auth secret is missing — never run with a guessable default
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

// Connect to database
connectDB();


const app = express();

// Behind Render's proxy — needed so req.ip (and rate limiting) sees the real client IP
app.set('trust proxy', 1);

// Use compression
app.use(compression());

// Security Headers
app.use(helmet());

// Global rate limit for all API routes
app.use('/api', globalLimiter);

// Body parser (capped to prevent oversized-payload abuse)
app.use(express.json({ limit: '100kb' }));

// Sanitize data against NoSQL query injection
app.use(sanitizeInput);

// Enable CORS — restrict to known origins.
//
// A trailing slash in CORS_ORIGIN (easy to paste by accident) would silently
// never match a real Origin header, which never has one — so it's stripped
// on both sides before comparing.
const stripTrailingSlash = (value) => value.trim().replace(/\/+$/, '');

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(stripTrailingSlash)
  .filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// Vercel mints a unique preview URL per deploy/branch
// (milquufresh-<hash>-<team>.vercel.app), so it can't be listed in
// CORS_ORIGIN by exact value — it's matched by pattern instead.
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/milquufresh-[a-z0-9-]+\.vercel\.app$/;

const isAllowedOrigin = (origin) =>
  allowedOrigins.includes(stripTrailingSlash(origin)) || VERCEL_PREVIEW_ORIGIN.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header at all — a mobile app, curl, Postman, or a
      // server-to-server call. There's no browser enforcing same-origin
      // policy for these, so there's nothing to restrict.
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      // Tagged with a status so errorHandler returns a clean 403 instead of
      // the generic 500 it would otherwise fall back to — a rejected origin
      // is working as designed, not a server fault.
      return callback(Object.assign(new Error('Not allowed by CORS'), { status: 403 }));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP Logger
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Basic Route
app.get('/', (req, res) => {
  res.send('MILQUU FRESH API is running...');
});

// Strict rate limits on all login/register endpoints (brute-force protection)
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/delivery/login', authLimiter);

// Mount routes
// Serviceable localities — read by the customer app's address picker.
app.get('/api/service-areas', (req, res) => res.json(SERVICE_AREAS));

app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/erp', erpRoutes); // Mounted ERP routes
app.use('/api/delivery', deliveryRoutes);
app.use('/api/upload', uploadRoutes);

// API Documentation Route (development only — don't expose API internals in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}

// User routes are covered by the global limiter plus strict login limits above;
// free-sample and payment stay on the tighter public-endpoint limit
app.use('/api/users', userRoutes);
app.use('/api/payment', apiLimiter, paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/free-sample', apiLimiter, freeSampleRoutes);

// Error Handling Middleware
import * as Sentry from '@sentry/node';
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}
app.use(notFound);
app.use(errorHandler);

import http from 'http';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // The nightly subscription run. Previously the engine was imported here and
  // never called, so no order was ever generated automatically.
  startScheduler();
});
