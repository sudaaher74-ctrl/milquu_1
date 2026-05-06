const mongoose = require('mongoose');

const LoyaltyTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'cashback', 'wallet_credit', 'wallet_debit', 'referral_bonus', 'vip_upgrade', 'manual_adjustment'],
        required: true
    },
    points: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    note: { type: String, default: '' },
    referenceId: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const LoyaltyAccountSchema = new mongoose.Schema({
    customerPhone: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    walletBalance: { type: Number, default: 0 },
    cashbackBalance: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    referralCode: { type: String, default: '' },
    referredByCode: { type: String, default: '' },
    referralRewards: { type: Number, default: 0 },
    totalLifetimeValue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    repeatPurchaseRate: { type: Number, default: 0 },
    vipLevel: { type: String, enum: ['classic', 'silver', 'gold', 'platinum'], default: 'classic' },
    lastOrderAt: { type: Date, default: null },
    transactions: { type: [LoyaltyTransactionSchema], default: [] }
}, { timestamps: true });

LoyaltyAccountSchema.index({ vipLevel: 1, totalLifetimeValue: -1 });
LoyaltyAccountSchema.index({ customerName: 1 });

module.exports = mongoose.model('LoyaltyAccount', LoyaltyAccountSchema);
