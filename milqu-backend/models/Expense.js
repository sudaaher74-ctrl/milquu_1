const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['rent', 'salary', 'packaging', 'logistics', 'utilities', 'maintenance', 'marketing', 'other'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }
}, { timestamps: true });

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
