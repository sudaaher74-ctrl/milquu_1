require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { Server: SocketIOServer } = require('socket.io');
const { getAllowedCorsOrigins, getRequiredEnv, isAdminAuthDisabled, isProduction } = require('./config');
const { ensureDefaultProducts } = require('./utils/seed-default-products');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const allowedCorsOrigins = new Set(getAllowedCorsOrigins());

// ── Socket.IO setup ─────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedCorsOrigins.size > 0 ? [...allowedCorsOrigins] : '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

app.disable('x-powered-by');
app.set('trust proxy', 1);

// HTTPS redirect in production (behind reverse proxy)
if (isProduction()) {
    app.use((req, res, next) => {
        if (req.get('X-Forwarded-Proto') !== 'https') {
            return res.redirect(301, `https://${req.get('Host')}${req.url}`);
        }
        next();
    });
}

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedCorsOrigins.size === 0 || allowedCorsOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS_NOT_ALLOWED'));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers via helmet (includes Content-Security-Policy)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
        features: {
            camera: [],
            microphone: [],
            geolocation: []
        }
    }
}));

// Gzip/Brotli compression for all responses
app.use(compression());

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    fallthrough: true,
    maxAge: '7d'
}));

mongoose.connect(getRequiredEnv('MONGO_URI'))
    .then(async () => {
        await ensureDefaultProducts();
        console.log('MongoDB connected to milqu_fresh database');
    })
    .catch((err) => {
        console.error('MongoDB connection failed. Continuing without database so frontend can still be served locally:', err.message);
        // Removed process.exit(1) to allow the server to keep running for offline demo purposes.
    });

app.use('/api/orders', require('./routes/orders'));
app.use('/api/areas', require('./routes/areas'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/content', require('./routes/content'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    const isHealthy = dbState === 1;
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        service: 'Milqu Fresh API',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

app.use(express.static(FRONTEND_DIR));

app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(path.join(FRONTEND_DIR, 'admin.html'));
});

app.use((req, res) => {
    // Serve index.html for browser navigation (non-API routes)
    const isApiRoute = req.originalUrl.startsWith('/api/');
    const acceptsHtml = req.accepts('html');
    if (!isApiRoute && acceptsHtml) {
        return res.status(404).sendFile(path.join(FRONTEND_DIR, 'index.html'));
    }
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
    if (err && err.message === 'CORS_NOT_ALLOWED') {
        return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
    }

    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

const server = httpServer.listen(PORT, () => {
    console.log(`[Socket.IO] Real-time sync enabled`);
    if (allowedCorsOrigins.size === 0) {
        console.warn('CORS_ORIGIN is not set. Cross-origin requests are currently allowed from any origin.');
    }
    if (isAdminAuthDisabled()) {
        console.warn('ADMIN_AUTH_DISABLED is enabled. Do not use this setting in production.');
    }
    console.log(`Milqu Fresh backend running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
        }
        process.exit(0);
    });
    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
