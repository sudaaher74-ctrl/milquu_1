import Financier from '../models/Financier.js';
import FinancierTransaction from '../models/FinancierTransaction.js';
import Purchase from '../models/Purchase.js';
import VendorPayment from '../models/VendorPayment.js';
import Order from '../models/Order.js';
import { recordAudit } from '../utils/audit.js';

const exactCaseInsensitive = (name = '') => new RegExp(`^${name.trim()}$`, 'i');

/**
 * GET /api/erp/financiers
 * Get all financiers, summary metrics, and customer credit comparison.
 */
export const getFinanciersSummary = async (req, res) => {
  try {
    const financiers = await Financier.find().sort({ createdAt: -1 }).lean();

    // Calculate aggregated metrics from DB
    const totals = financiers.reduce(
      (acc, f) => {
        acc.totalFinanced += f.totalFinanced || 0;
        acc.totalRepaid += f.totalRepaid || 0;
        acc.totalOutstanding += f.currentOutstanding || 0;
        return acc;
      },
      { totalFinanced: 0, totalRepaid: 0, totalOutstanding: 0 }
    );

    // Live customer credit comparison (unpaid POS customer orders)
    const customerCreditAgg = await Order.aggregate([
      { $match: { orderSource: 'POS', isPaid: false } },
      { $group: { _id: null, totalDue: { $sum: '$totalPrice' } } }
    ]);
    const totalCustomerCredit = customerCreditAgg[0]?.totalDue || 0;

    // Recent 5 transactions for quick dashboard overview
    const recentTransactions = await FinancierTransaction.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      financiers,
      metrics: {
        totalFinancedAll: totals.totalFinanced,
        totalRepaidAll: totals.totalRepaid,
        totalOutstandingAll: totals.totalOutstanding,
        financiersCount: financiers.length,
        totalCustomerCredit,
        workingCapitalGap: totalCustomerCredit - totals.totalOutstanding
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financiers summary', error: error.message });
  }
};

/**
 * GET /api/erp/financiers/:id
 * Get single financier profile with current metrics.
 */
export const getFinancierById = async (req, res) => {
  try {
    const financier = await Financier.findById(req.params.id);
    if (!financier) {
      return res.status(404).json({ message: 'Financier not found' });
    }
    res.json(financier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financier', error: error.message });
  }
};

/**
 * POST /api/erp/financiers
 * Create a new financier profile.
 */
export const createFinancier = async (req, res) => {
  try {
    const { name, phone = '', email = '', address = '', notes = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Financier name is required' });
    }

    const existing = await Financier.findOne({ name: exactCaseInsensitive(name) });
    if (existing) {
      return res.status(400).json({ message: 'A financier with this name already exists' });
    }

    const financier = new Financier({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim(),
      totalFinanced: 0,
      totalRepaid: 0,
      currentOutstanding: 0,
      isActive: true
    });

    await financier.save();

    await recordAudit(req, {
      action: 'financier.create',
      entity: 'Financier',
      entityId: financier._id,
      summary: `Created financier profile for "${financier.name}"`,
      meta: { name: financier.name, phone: financier.phone }
    });

    res.status(201).json(financier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating financier', error: error.message });
  }
};

/**
 * PUT /api/erp/financiers/:id
 * Update financier profile.
 */
export const updateFinancier = async (req, res) => {
  try {
    const { name, phone, email, address, notes, isActive } = req.body;
    const financier = await Financier.findById(req.params.id);
    if (!financier) {
      return res.status(404).json({ message: 'Financier not found' });
    }

    if (name && name.trim()) financier.name = name.trim();
    if (phone !== undefined) financier.phone = phone.trim();
    if (email !== undefined) financier.email = email.trim();
    if (address !== undefined) financier.address = address.trim();
    if (notes !== undefined) financier.notes = notes.trim();
    if (isActive !== undefined) financier.isActive = Boolean(isActive);

    await financier.save();

    await recordAudit(req, {
      action: 'financier.update',
      entity: 'Financier',
      entityId: financier._id,
      summary: `Updated financier profile "${financier.name}"`
    });

    res.json(financier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating financier', error: error.message });
  }
};

/**
 * DELETE /api/erp/financiers/:id
 * Deactivate or delete financier profile.
 */
export const deleteFinancier = async (req, res) => {
  try {
    const financier = await Financier.findById(req.params.id);
    if (!financier) {
      return res.status(404).json({ message: 'Financier not found' });
    }

    const txnCount = await FinancierTransaction.countDocuments({ financier: financier._id });
    if (txnCount > 0) {
      // If transactions exist, we don't hard-delete to protect accounting history
      financier.isActive = false;
      await financier.save();
      return res.json({ 
        message: 'Financier has existing transactions. Profile has been marked Inactive to preserve accounting ledger.',
        financier 
      });
    }

    await Financier.findByIdAndDelete(req.params.id);

    await recordAudit(req, {
      action: 'financier.delete',
      entity: 'Financier',
      entityId: req.params.id,
      summary: `Deleted financier "${financier.name}"`
    });

    res.json({ message: 'Financier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting financier', error: error.message });
  }
};

/**
 * GET /api/erp/financiers/:id/ledger
 * Get ledger/passbook transactions for a financier (or all).
 */
export const getFinancierLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type, search } = req.query;

    const query = {};
    if (id && id !== 'all') {
      query.financier = id;
    }

    if (type && type !== 'all') {
      query.type = type; // 'FINANCED' or 'REPAYMENT'
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { transactionId: { $regex: s, $options: 'i' } },
        { financierName: { $regex: s, $options: 'i' } },
        { linkedVendor: { $regex: s, $options: 'i' } },
        { reference: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } }
      ];
    }

    const transactions = await FinancierTransaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financier ledger', error: error.message });
  }
};

/**
 * POST /api/erp/financiers/transaction
 * Record an investment (milk bill paid by financier) OR a repayment to financier.
 */
export const recordFinancierTransaction = async (req, res) => {
  try {
    const {
      financierId,
      type, // 'FINANCED' or 'REPAYMENT'
      amount,
      date = new Date(),
      paymentMode = 'UPI',
      reference = '',
      linkedVendor = '',
      purchaseId = null,
      notes = '',
      clearVendorDue = false // If true, auto-records vendor payment in Purchases khata!
    } = req.body;

    if (!financierId) {
      return res.status(400).json({ message: 'Please select a financier' });
    }

    const validTypes = ['FINANCED', 'REPAYMENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Transaction type must be FINANCED or REPAYMENT' });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const financier = await Financier.findById(financierId);
    if (!financier) {
      return res.status(404).json({ message: 'Financier not found' });
    }

    const transactionId = `FTX-${Date.now().toString().slice(-6)}`;
    let createdVendorPayment = null;

    // If FINANCED: Financier pays vendor bill or injects capital
    if (type === 'FINANCED') {
      financier.totalFinanced = (financier.totalFinanced || 0) + numAmount;
      financier.currentOutstanding = Math.max(0, (financier.totalFinanced || 0) - (financier.totalRepaid || 0));

      // Optional smart integration: automatically record vendor payment in milk purchase ledger!
      if (clearVendorDue && linkedVendor && linkedVendor.trim()) {
        const vPaymentId = `VP-${Date.now().toString().slice(-6)}`;
        let linkedPoNumber = '';

        if (purchaseId) {
          const purchase = await Purchase.findById(purchaseId);
          if (purchase) {
            linkedPoNumber = purchase.poNumber;
            purchase.paidAmount = (purchase.paidAmount || 0) + numAmount;
            purchase.balanceAmount = Math.max(0, (purchase.totalCost || 0) - purchase.paidAmount);
            purchase.status = purchase.balanceAmount === 0 ? 'Paid' : 'Partial';
            purchase.payments.push({
              amount: numAmount,
              date,
              paymentMode: `Financier (${financier.name})`,
              reference: reference || transactionId,
              notes: `Paid by Financier: ${notes || ''}`
            });
            await purchase.save();
          }
        } else {
          // Allocate payment to oldest unpaid purchases of this vendor
          let remaining = numAmount;
          const unpaidPurchases = await Purchase.find({
            supplierName: exactCaseInsensitive(linkedVendor),
            status: { $in: ['Pending', 'Partial', 'Received'] }
          }).sort({ date: 1 });

          for (const pur of unpaidPurchases) {
            if (remaining <= 0) break;
            const curDue = pur.balanceAmount || Math.max(0, pur.totalCost - (pur.paidAmount || 0));
            if (curDue > 0) {
              const allocate = Math.min(remaining, curDue);
              pur.paidAmount = (pur.paidAmount || 0) + allocate;
              pur.balanceAmount = Math.max(0, pur.totalCost - pur.paidAmount);
              pur.status = pur.balanceAmount === 0 ? 'Paid' : 'Partial';
              pur.payments.push({
                amount: allocate,
                date,
                paymentMode: `Financier (${financier.name})`,
                reference: reference || transactionId,
                notes: `Paid by Financier: ${notes || ''}`
              });
              await pur.save();
              remaining -= allocate;
              if (!linkedPoNumber) linkedPoNumber = pur.poNumber;
            }
          }
        }

        createdVendorPayment = new VendorPayment({
          paymentId: vPaymentId,
          supplierName: linkedVendor.trim(),
          purchaseId: purchaseId || undefined,
          poNumber: linkedPoNumber,
          amount: numAmount,
          paymentMode: `Financier (${financier.name})`,
          reference: reference || transactionId,
          date,
          notes: `Paid on behalf of MilQuu by Financier ${financier.name}. ${notes || ''}`
        });
        await createdVendorPayment.save();
      }
    } else {
      // REPAYMENT: MilQuu repays the financier in lump sum from customer collections
      financier.totalRepaid = (financier.totalRepaid || 0) + numAmount;
      financier.currentOutstanding = Math.max(0, (financier.totalFinanced || 0) - (financier.totalRepaid || 0));
    }

    await financier.save();

    const transaction = new FinancierTransaction({
      transactionId,
      financier: financier._id,
      financierName: financier.name,
      type,
      amount: numAmount,
      date,
      paymentMode,
      reference,
      linkedVendor: linkedVendor.trim(),
      purchaseId: purchaseId || undefined,
      vendorPaymentId: createdVendorPayment ? createdVendorPayment._id : undefined,
      notes: notes.trim(),
      runningBalance: financier.currentOutstanding
    });

    await transaction.save();

    await recordAudit(req, {
      action: type === 'FINANCED' ? 'financier.financed' : 'financier.repayment',
      entity: 'Financier',
      entityId: financier._id,
      summary: `${type === 'FINANCED' ? 'Recorded milk bill financed' : 'Recorded repayment'} of ₹${numAmount} for financier "${financier.name}"`,
      meta: { transactionId, amount: numAmount, type, paymentMode, reference }
    });

    res.status(201).json({
      message: `${type === 'FINANCED' ? 'Financing entry' : 'Repayment entry'} recorded successfully`,
      transaction,
      financier
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording transaction', error: error.message });
  }
};

/**
 * DELETE /api/erp/financiers/transaction/:id
 * Delete/void a transaction and update the financier ledger balance.
 */
export const deleteFinancierTransaction = async (req, res) => {
  try {
    const transaction = await FinancierTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const financier = await Financier.findById(transaction.financier);
    if (financier) {
      if (transaction.type === 'FINANCED') {
        financier.totalFinanced = Math.max(0, (financier.totalFinanced || 0) - transaction.amount);
      } else {
        financier.totalRepaid = Math.max(0, (financier.totalRepaid || 0) - transaction.amount);
      }
      financier.currentOutstanding = Math.max(0, (financier.totalFinanced || 0) - (financier.totalRepaid || 0));
      await financier.save();
    }

    // If an associated VendorPayment was auto-created, delete it too
    if (transaction.vendorPaymentId) {
      await VendorPayment.findByIdAndDelete(transaction.vendorPaymentId);
    }

    await FinancierTransaction.findByIdAndDelete(req.params.id);

    await recordAudit(req, {
      action: 'financier.transaction.delete',
      entity: 'Financier',
      entityId: transaction.financier,
      summary: `Deleted transaction ${transaction.transactionId} of ₹${transaction.amount} for "${transaction.financierName}"`
    });

    res.json({ message: 'Transaction deleted successfully', financier });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

