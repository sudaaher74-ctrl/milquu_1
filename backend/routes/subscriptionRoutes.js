import express from 'express';
import Subscription from '../models/Subscription.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { priceCrate, normaliseRhythm, legacyFrequency, PricingError } from '../services/subscriptionPricing.js';
import { istStartOfDay, istTomorrow, istDayOfWeek, istDateKey } from '../utils/ist.js';
import { isDeliveryDay } from '../utils/rhythm.js';
import { apiLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a new subscription/order
// @access  Public (Guest Checkout)
router.post('/', apiLimiter, async (req, res) => {
  try {
    const { user, name, phone, items, deliveryAddress, frequency } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'A subscription needs at least one item' });
    }
    if (!deliveryAddress || !String(deliveryAddress).trim()) {
      return res.status(400).json({ message: 'A delivery address is required' });
    }

    // Every price and total is recomputed from the Product collection. The
    // client's totalAmount and monthlyTotal are read but never trusted — an
    // unvalidated monthlyTotal used to be stored verbatim and then divided by
    // 30 to decide what to charge the wallet each day.
    const rhythm = normaliseRhythm(frequency);
    const priced = await priceCrate(items, { rhythm, weekdays: [], milkOnly: true });

    const subscription = new Subscription({
      subscriptionId: 'SUB-' + Date.now() + Math.floor(Math.random() * 1000),
      user: req.user ? req.user._id : user, // fallback to user from body if guest
      name,
      phone,
      items: priced.items,
      totalAmount: priced.dailyTotal,
      dailyTotal: priced.dailyTotal,
      monthlyTotal: priced.monthlyTotal,
      deliveryAddress,
      frequency: legacyFrequency(rhythm),
      status: 'Pending' // Force pending
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
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
    // The day being delivered, as an Indian calendar date. This used to be
    // computed by adding 5h30m to a Date and then calling getDay(), which reads
    // the *host's* local day — wrong on any server not already in IST, which
    // includes Render.
    const requestedDate = req.query.date ? new Date(req.query.date) : new Date();
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: 'That date is not valid' });
    }

    const startOfToday = istStartOfDay(requestedDate);
    const endOfToday = new Date(istTomorrow(requestedDate).getTime() - 1);
    const dayOfWeek = istDayOfWeek(requestedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[dayOfWeek];

    // Paginated. Loading every active subscription into an array does not
    // survive thousands of customers, and the delivery round is read on a
    // phone. `limit=0` is not accepted — an unbounded page is the thing being
    // removed.
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 200));

    // Narrow in the database as far as the schema allows: active, started, and
    // not skipped today. The rhythm itself (alternate days, chosen weekdays)
    // depends on each subscription's own start date, so isDeliveryDay makes the
    // final call per row — but only over one page, not the whole collection.
    const query = {
      status: { $in: ['Active', 'active'] },
      $and: [
        { $or: [{ startDate: { $lte: endOfToday } }, { startDate: { $exists: false } }] },
        { $or: [{ skipDates: { $ne: startOfToday } }, { skipDates: { $exists: false } }] }
      ]
    };
    if (req.query.area) query.deliveryArea = req.query.area;

    const totalCandidates = await Subscription.countDocuments(query);
    const candidates = await Subscription.find(query)
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product', 'name image')
      .lean();

    const todayDeliveries = candidates.filter((sub) => isDeliveryDay(sub, startOfToday));

    const cutoff = new Date(startOfToday.getTime() - 2 * 60 * 60 * 1000);

    const todayOrders = await Order.find({
      isDelivered: false,
      $or: [
        { scheduledDeliveryDate: { $gte: startOfToday, $lte: endOfToday } },
        { scheduledDeliveryDate: null, createdAt: { $gte: cutoff, $lte: endOfToday } },
        { scheduledDeliveryDate: { $exists: false }, createdAt: { $gte: cutoff, $lte: endOfToday } }
      ]
    }).populate('user', 'name').lean();

    const staffList = await DeliveryStaff.find({ status: 'Active' }).lean();

    // The engine now generates a real, wallet-paid Order for each subscription
    // delivery. Listing both the subscription and its order would show the same
    // bottle of milk twice on the round, so the order is folded into the
    // subscription row it came from and only genuinely standalone orders (the
    // storefront, the ERP, guest checkout) are listed separately.
    const ordersBySubscription = new Map();
    const standaloneOrders = [];
    for (const order of todayOrders) {
      if (order.subscription) ordersBySubscription.set(String(order.subscription), order);
      else standaloneOrders.push(order);
    }

    const subResults = todayDeliveries.map(sub => {
      const generated = ordersBySubscription.get(String(sub._id));
      return {
        ...sub,
        assignedStaffInfo: staffList.find(s => s._id.toString() === (sub.assignedStaff || '').toString()) || null,
        // Present when tonight's engine run has already produced the order.
        orderId: generated?._id || null,
        isPaid: generated?.isPaid ?? false,
        deliveryStatus: generated?.deliveryStatus || null
      };
    });

    const orderResults = standaloneOrders.map(order => ({
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
      date: istDateKey(startOfToday),
      dayName: todayName,
      totalDeliveries: result.length,
      subscriptions: result,
      staffList,
      page,
      limit,
      totalCandidates,
      hasMore: page * limit < totalCandidates
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
