const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } } // Auto-delete after 10 mins
}, { timestamps: true });

module.exports = mongoose.model('OTP', OTPSchema);
