const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    pincodes: { type: [String], default: [] },
    lat: { type: Number, default: 28.6139 }, // Default to Delhi for this project context
    lng: { type: Number, default: 77.2090 },
    radius: { type: Number, default: 5000 }, // in meters
    color: { type: String, default: '#16a34a' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AreaSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Area', AreaSchema);
