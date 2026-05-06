const express = require('express');
const OTP = require('../models/OTP');
const { sendSMS } = require('../utils/whatsapp');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const otpLimiter = createRateLimiter({
    namespace: 'otp-request',
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many OTP attempts. Please try again in 15 minutes.'
});

// Send OTP
router.post('/send-otp', otpLimiter, async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB (overwrites existing for this phone)
        await OTP.findOneAndUpdate(
            { phone },
            { code, expiresAt: new Date(Date.now() + 10 * 60000) },
            { upsert: true }
        );

        // Send SMS
        const body = `Your Milqu Fresh verification code is: ${code}. Valid for 10 minutes.`;
        const sid = await sendSMS(phone, body);

        // If Twilio fails (e.g. no credit), we still succeed in 'Mock Mode' for the demo
        if (!sid) {
            console.log(`[AUTH] Mock OTP for ${phone}: ${code}`);
            return res.json({ 
                success: true, 
                message: 'OTP sent successfully (Demo Mode).',
                mock: true,
                code: code // Returning code only for demo/dev purposes if Twilio is not configured
            });
        }

        res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ success: false, message: 'Phone and code are required.' });
        }

        const record = await OTP.findOne({ phone, code });
        if (!record) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // Success - delete OTP
        await OTP.deleteOne({ _id: record._id });

        res.json({ success: true, message: 'Phone verified successfully.' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, message: 'Verification failed.' });
    }
});

module.exports = router;
