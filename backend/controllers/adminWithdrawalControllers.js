import WithdrawalRequest from '../models/WithdrawalRequest.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({}).populate('user', 'name phone walletBalance').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    const request = await WithdrawalRequest.findById(id).populate('user');
    if (!request) return res.status(404).json({ message: 'Withdrawal request not found' });

    if (request.status === 'Completed' || request.status === 'Rejected') {
      return res.status(400).json({ message: 'Cannot update a closed withdrawal request' });
    }

    const user = request.user;

    if (status === 'Approved' || status === 'Completed') {
      // Re-verify withdrawable balance before completing to prevent race conditions
      let reservedBalance = 0;
      
      const Subscription = (await import('../models/Subscription.js')).default;
      const activeSubs = await Subscription.find({ user: user._id, status: { $in: ['Active', 'active'] } });
      activeSubs.forEach(sub => reservedBalance += (sub.monthlyTotal / 30));

      const Order = (await import('../models/Order.js')).default;
      const pendingOrders = await Order.find({ user: user._id, isPaid: false, isDelivered: false });
      pendingOrders.forEach(order => reservedBalance += order.totalPrice);

      const withdrawableBalance = Math.max(0, (user.walletBalance || 0) - reservedBalance);

      if (request.amount > withdrawableBalance) {
        // Auto Reject because conditions changed
        request.status = 'Rejected';
        request.adminRemarks = 'System Auto-Rejected: Insufficient withdrawable balance at time of approval due to pending deliveries.';
        await request.save();
        console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund request was rejected due to insufficient withdrawable balance.`);
        return res.status(400).json({ message: 'Auto-Rejected: User no longer has sufficient withdrawable balance.', request });
      }

      // Deduct from User Wallet
      user.walletBalance -= request.amount;
      await user.save();

      // Create Wallet Transaction
      await WalletTransaction.create({
        user: user._id,
        amount: request.amount,
        type: 'debit',
        description: `Refund Withdrawal ${status === 'Approved' ? 'Approved' : 'Completed'}`,
        balanceAfter: user.walletBalance
      });

      request.status = status;
      request.processedAt = Date.now();
      request.adminRemarks = adminRemarks || 'Approved and processed by Admin.';

      console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund of ₹${request.amount} has been ${status}.`);
    } else {
      // Just updating status to Under Review or Rejected
      request.status = status;
      if (adminRemarks) request.adminRemarks = adminRemarks;
      if (status === 'Rejected') {
        request.processedAt = Date.now();
        console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund request was rejected. Reason: ${adminRemarks || 'Contact support'}.`);
      }
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
