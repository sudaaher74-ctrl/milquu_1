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
const { initReportScheduler } = require('./jobs/report-cron');
const { ensureDefaultProducts } = require('./utils/seed-default-products');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const allowedCorsOrigins = new Set([
    ...getAllowedCorsOrigins(),
    'https://milquu-1-muhj.vercel.app',
    'https://milquu-1-1.onrender.com'
]);

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
app.set('connectToDatabase', connectToDatabase);

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
    origin: function (origin, callback) {
        if (!origin || allowedCorsOrigins.has(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Security headers via helmet (includes Content-Security-Policy)
const cspOrigins = [
    ...allowedCorsOrigins, 
    'https://milquu-1-muhj.vercel.app', 
    'https://*.vercel.app', 
    'https://*.onrender.com'
];

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io", "https://cdn.jsdelivr.net", ...cspOrigins],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:", "https://*.openstreetmap.org", "https://cdn-icons-png.flaticon.com"],
            connectSrc: ["'self'", "ws:", "wss:", ...cspOrigins],
            frameSrc: ["'self'", "https://www.google.com"],
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

// MongoDB Connection (Serverless optimized)
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    try {
        // We use process.env directly here to avoid global crashing if it's missing momentarily
        const uri = process.env.MONGO_URI || getRequiredEnv('MONGO_URI');
        const db = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        await ensureDefaultProducts();
        console.log('MongoDB connected to milqu_fresh database');
        cachedDb = db;
        return db;
    } catch (err) {
        console.error('MongoDB connection failed. Please ensure MONGO_URI is set:', err.message);
        throw err;
    }
}

// Add a middleware to ensure database connection before API routes
app.use('/api', async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database connection failed. Please check Vercel Environment Variables.' });
    }
});


app.use('/api/orders', require('./routes/orders'));
app.use('/api/areas', require('./routes/areas'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/content', require('./routes/content'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/export', require('./routes/export'));

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

if (require.main === module) {
    const server = httpServer.listen(PORT, () => {
        console.log(`[Socket.IO] Real-time sync enabled`);
        if (allowedCorsOrigins.size === 0) {
            console.warn('CORS_ORIGIN is not set. Cross-origin requests are currently allowed from any origin.');
        }
        if (isAdminAuthDisabled()) {
            console.warn('ADMIN_AUTH_DISABLED is enabled. Do not use this setting in production.');
        }

        // JWT_SECRET Check Log
        if (process.env.JWT_SECRET) {
            console.log('[Config] JWT_SECRET is loaded successfully.');
        } else {
            console.warn('[Config] WARNING: JWT_SECRET is NOT set! Authentication will use development fallback or fail.');
        }

        console.log(`Milqu Fresh backend running on http://localhost:${PORT}`);
        console.log(`Health: http://localhost:${PORT}/api/health`);

        connectToDatabase()
            .then(() => initReportScheduler({ connectToDatabase }))
            .catch((err) => {
                console.error('[Startup] Database warmup failed:', err.message);
            });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
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
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
