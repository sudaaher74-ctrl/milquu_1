const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: [
            'rent', 'salary', 'staff_salary', 'packaging', 'logistics', 'delivery_fuel',
            'utilities', 'electricity', 'maintenance', 'marketing', 'milk_purchase',
            'farm', 'misc', 'other'
        ],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    vendor: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', default: null },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }
}, { timestamps: true });

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ area_id: 1, date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
