const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    action: {
        type: String,
        enum: [
            'order_deduction',
            'restock',
            'manual_adjustment',
            'expiry_removal',
            'cancellation_restore',
            'wastage',
            'batch_adjustment'
        ],
        required: true
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, default: '' },
    orderId: { type: String, required: false },
    batchCode: { type: String, default: '' },
    expiryDate: { type: Date, default: null },
    costImpact: { type: Number, default: 0 },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }
}, { timestamps: true });

InventoryLogSchema.index({ productId: 1, createdAt: -1 });
InventoryLogSchema.index({ action: 1, createdAt: -1 });
InventoryLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
