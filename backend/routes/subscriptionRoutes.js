import express from 'express';
import Subscription from '../models/Subscription.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a new subscription/order
// @access  Public (Guest Checkout)
router.post('/', async (req, res) => {
  try {
    const { user, name, phone, items, totalAmount, deliveryAddress, frequency, status, monthlyTotal } = req.body;

    const subscription = new Subscription({
      subscriptionId: 'SUB-' + Date.now() + Math.floor(Math.random() * 1000),
      user,
      name,
      phone,
      items: items || [],
      totalAmount: totalAmount || 0,
      deliveryAddress,
      frequency,
      status: status || 'Pending',
      monthlyTotal
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription (status, assigned staff, etc.)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/subscriptions/today-orders
// @desc    Generate today's delivery list from all active subscriptions
// @access  Private/Admin
router.get('/today-orders', protect, admin, async (req, res) => {
  try {
    const todayIST = new Date();
    // IST offset
    todayIST.setHours(todayIST.getHours() + 5, todayIST.getMinutes() + 30);
    const dayOfWeek = todayIST.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[dayOfWeek];

    // Get all active subscriptions
    const activeSubscriptions = await Subscription.find({
      status: { $in: ['Active', 'active'] }
    }).populate('items.product', 'name image').lean();

    // Filter by frequency — should this sub deliver today?
    const todayDeliveries = activeSubscriptions.filter(sub => {
      const freq = (sub.frequency || 'daily').toLowerCase();
      if (freq === 'daily') return true;
      if (freq === 'alternate days' || freq === 'alternate') {
        // deliver every alternate day from startDate
        const startDate = new Date(sub.startDate || sub.createdAt);
        const diffDays = Math.floor((todayIST - startDate) / (1000 * 60 * 60 * 24));
        return diffDays % 2 === 0;
      }
      if (freq === 'weekly') {
        // deliver on same day of week as start date
        const startDate = new Date(sub.startDate || sub.createdAt);
        return startDate.getDay() === dayOfWeek;
      }
      return true; // default include
    });

    // Fetch regular cart orders for today
    const startOfToday = new Date(todayIST);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(todayIST);
    endOfToday.setHours(23, 59, 59, 999);

    const cutoff = new Date(startOfToday);
    cutoff.setHours(-2);

    const todayOrders = await Order.find({
      isDelivered: false,
      $or: [
        { scheduledDeliveryDate: { $gte: startOfToday, $lte: endOfToday } },
        { scheduledDeliveryDate: null, createdAt: { $gte: cutoff, $lte: endOfToday } },
        { scheduledDeliveryDate: { $exists: false }, createdAt: { $gte: cutoff, $lte: endOfToday } }
      ]
    }).populate('user', 'name').lean();

    const staffList = await DeliveryStaff.find({ status: 'Active' }).lean();

    const subResults = todayDeliveries.map(sub => ({
      ...sub,
      assignedStaffInfo: staffList.find(s => s._id.toString() === (sub.assignedStaff || '').toString()) || null
    }));

    const orderResults = todayOrders.map(order => ({
      _id: order._id,
      name: order.name || order.user?.name || 'Guest',
      phone: order.phone,
      deliveryAddress: order.shippingAddress ? `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}` : 'No Address',
      frequency: 'One-time',
      status: order.status || 'Active',
      items: (order.orderItems || []).map(oi => ({
        name: oi.name,
        quantity: oi.qty,
        price: oi.price,
        product: oi.product
      })),
      assignedStaff: order.deliveryStaff,
      assignedStaffInfo: staffList.find(s => s._id.toString() === (order.deliveryStaff || '').toString()) || null,
      deliverySlot: order.deliverySlot || 'Morning'
    }));

    const result = [...subResults, ...orderResults];

    res.json({
      date: todayIST.toISOString().split('T')[0],
      dayName: todayName,
      totalDeliveries: result.length,
      subscriptions: result,
      staffList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/subscriptions/:id/assign-staff
// @desc    Assign a delivery boy to a subscription or an order
// @access  Private/Admin
router.put('/:id/assign-staff', protect, admin, async (req, res) => {
  try {
    const { staffId } = req.body;
    let updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      { assignedStaff: staffId },
      { new: true }
    );
    if (!updated) {
      updated = await Order.findByIdAndUpdate(
        req.params.id,
        { deliveryStaff: staffId, deliveryStatus: 'Out For Delivery' },
        { new: true }
      );
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
