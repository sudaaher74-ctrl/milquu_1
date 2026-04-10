const express = require('express');
const Message = require('../models/Message');
const { createRateLimiter } = require('../middleware/rateLimit');
const { verifyToken, requireRole } = require('../middleware/auth');
const { generatePublicId } = require('../utils/public-id');
const { sanitizeMultilineText, sanitizeText } = require('../utils/sanitize');

const router = express.Router();
const publicMessageLimiter = createRateLimiter({
    namespace: 'messages-post',
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many messages from this connection. Please wait a minute and try again.'
});

router.post('/', publicMessageLimiter, async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const cleanName = sanitizeText(name);
        const cleanEmail = sanitizeText(email).toLowerCase();
        const cleanPhone = sanitizeText(phone);
        const cleanSubject = sanitizeText(subject);
        const cleanMessage = sanitizeMultilineText(message);

        if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
        }

        const messageId = generatePublicId('MSG');
        const msg = new Message({
            messageId,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            subject: cleanSubject,
            message: cleanMessage,
            status: 'unread'
        });
        await msg.save();

        res.status(201).json({
            success: true,
            message: "Message sent! We'll reply soon.",
            messageId
        });
    } catch (err) {
        console.error('Message error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

router.get('/', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
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

router.patch('/:messageId/status', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
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
        if (!msg) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        res.json({ success: true, message: 'Message status updated.', msg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
