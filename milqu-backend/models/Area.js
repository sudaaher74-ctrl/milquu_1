const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    pincodes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AreaSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Area', AreaSchema);
