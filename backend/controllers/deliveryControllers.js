import DeliveryStaff from '../models/DeliveryStaff.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import generateToken from '../utils/generateToken.js';
import { istStartOfDay, istTomorrow } from '../utils/ist.js';
import { exactCaseInsensitive } from '../utils/regex.js';

export const loginDeliveryStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Case-insensitive, but escaped: an email is not a pattern.
    const staff = await DeliveryStaff.findOne({ email: exactCaseInsensitive(email) });
    
    if (staff && staff.status !== 'Inactive' && (await staff.matchPassword(password))) {
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
    // "Today" is the Indian calendar day. The host clock is UTC on Render, so
    // setHours() used to switch the round to tomorrow's orders at 5:30 am IST
    // — in the middle of the morning deliveries.
    const startOfToday = istStartOfDay();
    const endOfToday = new Date(istTomorrow().getTime() - 1);

    // 10 PM IST yesterday, to catch orders placed for the morning round
    const cutoff = new Date(startOfToday.getTime() - 2 * 60 * 60 * 1000);

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

/** An order assigned to the signed-in delivery person, or null. */
const findMyOrder = (id, staffId) => Order.findOne({ _id: id, deliveryStaff: staffId });

export const markOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofImageUrl, proofOfDelivery, cashCollected } = req.body;
    
    // Only the delivery person the order is assigned to can close it.
    const order = await findMyOrder(id, req.user._id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.isDelivered) {
      return res.json(order);
    }

    order.deliveryStatus = 'Delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.proofOfDelivery = proofImageUrl || proofOfDelivery || '';
    
    if (cashCollected && !order.isPaid) {
      order.paymentStatus = 'PAID';
      order.isPaid = true;
      order.paidAt = Date.now();
    } else if (order.paymentMethod === 'Wallet' && !order.isPaid && order.user) {
      // Auto deduct from the wallet — atomically, and only if it still covers
      // the order, so it can never go negative.
      const user = await User.findOneAndUpdate(
        { _id: order.user, walletBalance: { $gte: order.totalPrice } },
        { $inc: { walletBalance: -order.totalPrice } },
        { returnDocument: 'after' }
      );
      if (user) {
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
      } else {
        // Insufficient wallet balance — flag order for collection
        order.paymentStatus = 'PENDING';
        order.deliveryNotes = (order.deliveryNotes || '') + ' [Wallet balance insufficient at delivery time]';
      }
    }

    const updatedOrder = await order.save();
    await DeliveryStaff.findByIdAndUpdate(req.user._id, { $inc: { delivered: 1 } });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markOrderFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, failedReason } = req.body;
    
    const order = await findMyOrder(id, req.user._id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.isDelivered) {
      return res.status(400).json({ message: 'This order has already been delivered' });
    }

    order.deliveryStatus = 'Failed';
    order.isDelivered = false;
    order.failedReason = reason || failedReason || '';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/** The delivery app reports its own position — never anyone else's. */
export const updateMyLocation = async (req, res) => {
  try {
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    const staff = await DeliveryStaff.findByIdAndUpdate(
      req.user._id,
      { location: { lat, lng, lastUpdated: new Date() } },
      { returnDocument: 'after' }
    ).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json({ location: staff.location });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
