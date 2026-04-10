const express = require('express');
const Subscription = require('../models/Subscription');
const { createRateLimiter } = require('../middleware/rateLimit');
const { verifyToken, requireRole } = require('../middleware/auth');
const { generatePublicId } = require('../utils/public-id');
const { sanitizeMultilineText, sanitizeText } = require('../utils/sanitize');

const router = express.Router();
const SUBSCRIPTION_ROLES = ['super_admin', 'manager', 'delivery_staff'];
const publicSubscriptionLimiter = createRateLimiter({
    namespace: 'subscriptions-post',
    windowMs: 60 * 1000,
    max: 12,
    message: 'Too many subscription attempts from this connection. Please wait a minute and try again.'
});

router.post('/', publicSubscriptionLimiter, async (req, res) => {
    try {
        const { name, phone, address, milkType, qty, schedule, startDate, notes, monthlyTotal, paymentMethod } = req.body;
        const cleanName = sanitizeText(name);
        const cleanPhone = sanitizeText(phone);
        const cleanAddress = sanitizeText(address);
        const cleanMilkType = sanitizeText(milkType).toLowerCase();
        const cleanSchedule = sanitizeText(schedule).toLowerCase();
        const cleanNotes = sanitizeMultilineText(notes);
        const cleanMonthlyTotal = sanitizeText(monthlyTotal);
        const cleanPaymentMethod = sanitizeText(paymentMethod || 'upi').toLowerCase();

        if (!cleanName || !cleanPhone || !cleanAddress || !cleanMilkType || !qty || !cleanSchedule) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
        }
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number.' });
        }

        const subscriptionId = generatePublicId('SUB');
        const sub = new Subscription({
            subscriptionId,
            name: cleanName,
            phone: cleanPhone,
            address: cleanAddress,
            milkType: cleanMilkType,
            qty: parseFloat(qty),
            schedule: cleanSchedule,
            startDate,
            notes: cleanNotes,
            monthlyTotal: cleanMonthlyTotal,
            paymentMethod: cleanPaymentMethod || 'upi',
            status: 'active'
        });

        await sub.save();
        res.status(201).json({
            success: true,
            message: `Subscription ${subscriptionId} confirmed!`,
            subscriptionId,
            subscription: sub
        });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

router.get('/', verifyToken, requireRole(...SUBSCRIPTION_ROLES), async (req, res) => {
    try {
        const { status, page = 1, limit = 200 } = req.query;
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(500, Math.max(1, parseInt(limit, 10) || 200));
        const filter = status ? { status } : {};

        const subs = await Subscription.find(filter)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);
        const total = await Subscription.countDocuments(filter);
        res.json({ success: true, total, subscriptions: subs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:subscriptionId/status', verifyToken, requireRole(...SUBSCRIPTION_ROLES), async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['active', 'paused', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const sub = await Subscription.findOneAndUpdate(
            { subscriptionId: req.params.subscriptionId },
            { status },
            { new: true }
        );
        if (!sub) {
            return res.status(404).json({ success: false, message: 'Subscription not found.' });
        }
        res.json({ success: true, message: 'Subscription updated.', subscription: sub });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
