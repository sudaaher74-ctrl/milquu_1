import './sentry.js'; // Must be imported before express
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import productRoutes from './routes/productRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import erpRoutes from './routes/erpRoutes.js'; // Added ERP routes
import deliveryRoutes from './routes/deliveryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import freeSampleRoutes from './routes/freeSampleRoutes.js';
import { startSubscriptionEngine } from './cron/subscriptionEngine.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to database
connectDB();

// Start cron jobs
startSubscriptionEngine();

const app = express();

// Use compression
app.use(compression());

// Security Headers
app.use(helmet());

// Rate Limiter for sensitive endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser
app.use(express.json());

// Sanitize data against NoSQL query injection
// app.use(mongoSanitize());

// Sanitize data against XSS
// app.use(xss());

// Enable CORS
app.use(cors());

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

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/erp', erpRoutes); // Mounted ERP routes
app.use('/api/delivery', deliveryRoutes);
app.use('/api/upload', uploadRoutes);

// API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Apply rate limiting to user and free sample routes
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/payment', paymentRoutes);
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
});
