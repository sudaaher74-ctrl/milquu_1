const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productCode: { type: String, trim: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['milk', 'dairy', 'vegetables', 'fruits', 'other'] },
    description: { type: String, default: '' },
    image: { type: String, default: '' },        // filename stored in uploads/
    imageUrl: { type: String, default: '' },     // public relative URL for catalog products
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'out_of_stock'], default: 'active' },
    emoji: { type: String, default: '📦' },
    unit: { type: String, default: '/unit' },    // e.g. /L, /kg, /500g
    badge: { type: String, default: '' },        // Fresh, Popular, Organic, etc.
    nutrition: { type: [[String]], default: [] },
    createdAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', function (next) {
    if (this.stock <= 0) {
        this.stock = 0;
        this.status = 'out_of_stock';
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
