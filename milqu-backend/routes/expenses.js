const express = require('express');
const Expense = require('../models/Expense');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../services/activity-log');

const router = express.Router();
const EXPENSE_ROLES = ['super_admin', 'manager'];

// Add expense
router.post('/', verifyToken, requireRole(...EXPENSE_ROLES), async (req, res) => {
    try {
        const { category, amount, description, date, vendor, quantity, unitCost, gstAmount, area_id } = req.body;
        if (!category || !amount) {
            return res.status(400).json({ success: false, message: 'Category and amount are required.' });
        }

        const expense = new Expense({
            category,
            amount: parseFloat(amount),
            description: description || '',
            vendor: vendor || '',
            quantity: quantity ? parseFloat(quantity) : 0,
            unitCost: unitCost ? parseFloat(unitCost) : 0,
            gstAmount: gstAmount ? parseFloat(gstAmount) : 0,
            area_id: area_id || null,
            date: date ? new Date(date) : new Date(),
            createdBy: req.admin?._id
        });
        await expense.save();

        await logActivity(req, {
            module: 'expenses',
            action: 'create_expense',
            entityType: 'expense',
            entityId: String(expense._id),
            message: `Created ${expense.category} expense`,
            metadata: { amount: expense.amount }
        });

        res.status(201).json({ success: true, message: 'Expense added.', expense });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// List expenses
router.get('/', verifyToken, requireRole(...EXPENSE_ROLES), async (req, res) => {
    try {
        const { from, to, category, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); filter.date.$lte = end; }
        }
        if (category) filter.category = category;

        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);
        const total = await Expense.countDocuments(filter);

        res.json({ success: true, total, page: safePage, expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Expense summary
router.get('/summary', verifyToken, requireRole(...EXPENSE_ROLES), async (req, res) => {
    try {
        const { from, to } = req.query;
        const match = {};
        if (from || to) {
            match.date = {};
            if (from) match.date.$gte = new Date(from);
            if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); match.date.$lte = end; }
        }

        const byCategory = await Expense.aggregate([
            { $match: match },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        const grandTotal = byCategory.reduce((s, c) => s + c.total, 0);

        res.json({ success: true, grandTotal, byCategory });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete expense
router.delete('/:id', verifyToken, requireRole(...EXPENSE_ROLES), async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
        await logActivity(req, {
            module: 'expenses',
            action: 'delete_expense',
            entityType: 'expense',
            entityId: String(expense._id),
            message: `Deleted ${expense.category} expense`,
            metadata: { amount: expense.amount }
        });
        res.json({ success: true, message: 'Expense deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
