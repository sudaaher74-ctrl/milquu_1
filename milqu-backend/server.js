require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { getAllowedCorsOrigins, getRequiredEnv, isAdminAuthDisabled } = require('./config');
const { ensureDefaultProducts } = require('./utils/seed-default-products');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const allowedCorsOrigins = new Set(getAllowedCorsOrigins());

app.disable('x-powered-by');
app.set('trust proxy', 1);

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
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
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
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
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

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Milqu Fresh API',
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
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
    if (err && err.message === 'CORS_NOT_ALLOWED') {
        return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
    }

    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
    if (allowedCorsOrigins.size === 0) {
        console.warn('CORS_ORIGIN is not set. Cross-origin requests are currently allowed from any origin.');
    }
    if (isAdminAuthDisabled()) {
        console.warn('ADMIN_AUTH_DISABLED is enabled. Do not use this setting in production.');
    }
    console.log(`Milqu Fresh backend running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
});
