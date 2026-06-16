import DeliveryStaff from '../models/DeliveryStaff.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import generateToken from '../utils/generateToken.js';

export const loginDeliveryStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Use case-insensitive search for email
    const staff = await DeliveryStaff.findOne({ email: new RegExp('^' + email + '$', 'i') });
    
    if (staff && (await staff.matchPassword(password))) {
      res.json({
        _id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        area: staff.area,
        city: staff.city,
        role: 'delivery',
        token: generateToken(staff._id, 'delivery')
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const cutoff = new Date(startOfToday);
    cutoff.setHours(-2); // 10 PM yesterday, to catch cron orders

    const deliveries = await Order.find({ 
      deliveryStaff: req.user._id, 
      isDelivered: false,
      $or: [
        { scheduledDeliveryDate: { $gte: startOfToday, $lte: endOfToday } },
        { scheduledDeliveryDate: null, createdAt: { $gte: cutoff, $lte: endOfToday } },
        { scheduledDeliveryDate: { $exists: false }, createdAt: { $gte: cutoff, $lte: endOfToday } },
        { scheduledDeliveryDate: null, updatedAt: { $gte: cutoff, $lte: endOfToday } },
        { scheduledDeliveryDate: { $exists: false }, updatedAt: { $gte: cutoff, $lte: endOfToday } }
      ]
    }).populate('user', 'name email phone');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const markOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofImageUrl, cashCollected } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: Check if req.user._id matches order.deliveryStaff
    order.deliveryStatus = 'Delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.proofOfDelivery = proofImageUrl || '';
    
    if (cashCollected) {
      order.paymentStatus = 'PAID';
      order.isPaid = true;
      order.paidAt = Date.now();
    } else if (order.paymentMethod === 'Wallet' && !order.isPaid && order.user) {
      // Auto deduct from Wallet Phase 2
      const user = await User.findById(order.user);
      if (user) {
        user.walletBalance -= order.totalPrice;
        await user.save();
        
        await WalletTransaction.create({
          user: user._id,
          amount: order.totalPrice,
          type: 'debit',
          description: `Auto-deduction for delivery of Order #${order._id}`,
          balanceAfter: user.walletBalance
        });

        order.paymentStatus = 'PAID';
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markOrderFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryStatus = 'Failed';
    order.isDelivered = false;
    order.failedReason = reason || '';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
