// server.js  —  Milqu Fresh Backend
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware
app.use(cors({
  origin: '*',   // In production, replace * with your actual frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to milqu_fresh database'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── Routes
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/messages',      require('./routes/messages'));

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Milqu Fresh API',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Milqu Fresh backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});