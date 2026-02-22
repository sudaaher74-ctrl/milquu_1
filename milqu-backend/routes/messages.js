// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ── POST /api/messages  (contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const messageId = 'MSG-' + Date.now().toString().slice(-6);

    const msg = new Message({ messageId, name, email, phone, subject, message, status: 'unread' });
    await msg.save();

    res.status(201).json({
      success: true,
      message: "Message sent! We'll reply soon 💚",
      messageId
    });
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/messages  (admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    const total = await Message.countDocuments(filter);
    res.json({ success: true, total, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/messages/:id/status  (admin: mark read/replied)
router.patch('/:messageId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['unread', 'read', 'replied'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const msg = await Message.findOneAndUpdate(
      { messageId: req.params.messageId },
      { status },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message status updated.', msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;