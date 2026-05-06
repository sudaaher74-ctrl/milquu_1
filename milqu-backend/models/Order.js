const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    e: { type: String },
    unit: { type: String }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    notes: { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'assigned', 'out_for_delivery', 'delivered', 'failed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: false },
    assigned_delivery_boy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
    photo_proof_url: { type: String, required: false },
    stockRestoredAt: { type: Date, required: false },
    deliveryWindow: { type: String, enum: ['morning', 'evening', 'flexible'], default: 'morning' },
    assignedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    deliveryNotes: { type: String, default: '' },
    routeSequence: { type: Number, default: 0 },
    deliveryEtaMinutes: { type: Number, default: 0 },
    trackingLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        label: { type: String, default: '' },
        updatedAt: { type: Date, default: null }
    },
    deliveryOtp: {
        code: { type: String, default: '' },
        issuedAt: { type: Date, default: null },
        verifiedAt: { type: Date, default: null }
    },
    financials: {
        subtotal: { type: Number, default: 0 },
        grossRevenue: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        packagingCost: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        gstRate: { type: Number, default: 0.05 },
        gstAmount: { type: Number, default: 0 },
        refundAmount: { type: Number, default: 0 },
        netRevenue: { type: Number, default: 0 }
    }
}, { timestamps: true });

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
