import WithdrawalRequest from '../models/WithdrawalRequest.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';

export const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({}).populate('user', 'name phone walletBalance').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const WITHDRAWAL_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'];
// The wallet is debited when a request first reaches one of these. Moving
// Approved -> Completed afterwards only closes the request; it used to debit
// the customer a second time.
const PAYOUT_STATUSES = ['Approved', 'Completed'];

export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!WITHDRAWAL_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid withdrawal status' });
    }

    const request = await WithdrawalRequest.findById(id).populate('user');
    if (!request) return res.status(404).json({ message: 'Withdrawal request not found' });

    if (request.status === 'Completed' || request.status === 'Rejected') {
      return res.status(400).json({ message: 'Cannot update a closed withdrawal request' });
    }

    const user = request.user;
    if (!user) return res.status(404).json({ message: 'Customer for this request no longer exists' });

    const alreadyDebited = PAYOUT_STATUSES.includes(request.status);

    if (PAYOUT_STATUSES.includes(status) && !alreadyDebited) {
      // Re-verify withdrawable balance before paying out
      let reservedBalance = 0;

      const activeSubs = await Subscription.find({ user: user._id, status: { $in: ['Active', 'active'] } });
      activeSubs.forEach(sub => reservedBalance += (sub.monthlyTotal / 30));

      const pendingOrders = await Order.find({ user: user._id, isPaid: false, isDelivered: false });
      pendingOrders.forEach(order => reservedBalance += order.totalPrice);

      const withdrawableBalance = Math.max(0, (user.walletBalance || 0) - reservedBalance);

      // Debit atomically and only while the balance still covers it, so a
      // concurrent debit (the nightly engine, an order) cannot push it negative.
      const debited = request.amount <= withdrawableBalance
        ? await User.findOneAndUpdate(
            { _id: user._id, walletBalance: { $gte: request.amount } },
            { $inc: { walletBalance: -request.amount } },
            { returnDocument: 'after' }
          )
        : null;

      if (!debited) {
        request.status = 'Rejected';
        request.processedAt = Date.now();
        request.adminRemarks = 'System Auto-Rejected: Insufficient withdrawable balance at time of approval due to pending deliveries.';
        await request.save();
        console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund request was rejected due to insufficient withdrawable balance.`);
        return res.status(400).json({ message: 'Auto-Rejected: User no longer has sufficient withdrawable balance.', request });
      }

      await WalletTransaction.create({
        user: user._id,
        amount: request.amount,
        type: 'debit',
        description: `Refund Withdrawal ${status}`,
        balanceAfter: debited.walletBalance,
        performedBy: req.user._id
      });

      request.status = status;
      request.processedAt = Date.now();
      request.adminRemarks = adminRemarks || 'Approved and processed by Admin.';
      console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund of ₹${request.amount} has been ${status}.`);
    } else if (status === 'Rejected' && alreadyDebited) {
      // Rejecting a request whose money already left the wallet puts it back.
      const credited = await User.findByIdAndUpdate(
        user._id,
        { $inc: { walletBalance: request.amount } },
        { returnDocument: 'after' }
      );
      await WalletTransaction.create({
        user: user._id,
        amount: request.amount,
        type: 'credit',
        description: 'Refund Withdrawal Reversed',
        balanceAfter: credited.walletBalance,
        performedBy: req.user._id
      });
      request.status = 'Rejected';
      request.processedAt = Date.now();
      if (adminRemarks) request.adminRemarks = adminRemarks;
    } else if (!PAYOUT_STATUSES.includes(status) && alreadyDebited) {
      return res.status(400).json({ message: 'An approved request can only be completed or rejected' });
    } else {
      // Approved -> Completed, or a move between Pending / Under Review / Rejected
      request.status = status;
      if (adminRemarks) request.adminRemarks = adminRemarks;
      if (status === 'Rejected' || status === 'Completed') {
        request.processedAt = Date.now();
      }
      if (status === 'Rejected') {
        console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund request was rejected. Reason: ${adminRemarks || 'Contact support'}.`);
      }
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
