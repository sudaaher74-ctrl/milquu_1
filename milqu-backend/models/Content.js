// models/Content.js
const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, trim: true },    // e.g. 'homepage_banner_1'
    type: { type: String, required: true, enum: ['banner', 'offer', 'category', 'text'] },
    title: { type: String, default: '' },
    value: { type: String, default: '' },    // text content, description, or offer details
    image: { type: String, default: '' },    // image filename in uploads/
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },     // display order
    updatedAt: { type: Date, default: Date.now }
});

ContentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Content', ContentSchema);
