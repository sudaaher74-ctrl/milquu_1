const mongoose = require('mongoose');

const DeliveryStatusEventSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['assigned', 'out_for_delivery', 'delivered', 'failed', 'cancelled', 'otp_issued', 'otp_verified', 'location_ping'],
        required: true
    },
    note: { type: String, default: '' },
    location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        label: { type: String, default: '' }
    },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const DeliveryTrackingSchema = new mongoose.Schema({
    orderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', default: null },
    routeName: { type: String, default: '' },
    routeSequence: { type: Number, default: 0 },
    scheduleSlot: { type: String, enum: ['morning', 'evening', 'flexible'], default: 'morning' },
    etaMinutes: { type: Number, default: 0 },
    assignedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    otp: {
        code: { type: String, default: '' },
        issuedAt: { type: Date, default: null },
        verifiedAt: { type: Date, default: null },
        isVerified: { type: Boolean, default: false }
    },
    currentLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        label: { type: String, default: '' },
        updatedAt: { type: Date, default: null }
    },
    totalTravelMinutes: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
    statusHistory: { type: [DeliveryStatusEventSchema], default: [] }
}, { timestamps: true });

DeliveryTrackingSchema.index({ deliveryBoyId: 1, createdAt: -1 });
DeliveryTrackingSchema.index({ areaId: 1, createdAt: -1 });
DeliveryTrackingSchema.index({ scheduleSlot: 1, createdAt: -1 });

module.exports = mongoose.model('DeliveryTracking', DeliveryTrackingSchema);
