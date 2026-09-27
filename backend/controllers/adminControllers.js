import crypto from 'crypto';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import generateToken from '../utils/generateToken.js';
import { runSubscriptionEngine } from '../cron/subscriptionEngine.js';
import { istDateKey, istStartOfDay, istTomorrow, istStartOfYear, istStartOfMonth, istMonthYear, IST_TIMEZONE } from '../utils/ist.js';
import { normalisePhone } from '../utils/phone.js';

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    const staffRoles = ['admin', 'manager', 'staff', 'superadmin'];
    if (user && staffRoles.includes(user.role) && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id, user.role),
        role: user.role,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Subscription.countDocuments();
    
    const revAgg = await Subscription.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalRevenue = revAgg.length ? revAgg[0].total : 0;

    const recentOrders = await Subscription.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Subscription.find({}).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({}).sort({ createdAt: -1 }).lean();
    
    const orderStats = await Order.aggregate([
      { $match: { isPaid: true, user: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          lifetimeValue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const customersWithStats = customers.map(c => {
      const stats = orderStats.find(s => s._id.toString() === c._id.toString());
      return {
        ...c,
        orders: stats ? stats.totalOrders : 0,
        lifetimeValue: stats ? stats.lifetimeValue : 0,
        walletBalance: c.walletBalance || 0,
        status: (stats && stats.totalOrders > 5) ? 'VIP' : (stats && stats.totalOrders > 0 ? 'Active' : 'New')
      };
    }).sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    // Months are Indian calendar months (the server runs in UTC).
    const { year: nowYear, month: nowMonth } = istMonthYear();
    const istMonthStart = (y, m0) => istStartOfMonth(new Date(Date.UTC(y, m0, 15)));
    const sixMonthsAgo = istMonthStart(nowYear, nowMonth - 5);

    const usersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: { date: "$createdAt", timezone: IST_TIMEZONE } },
            month: { $month: { date: "$createdAt", timezone: IST_TIMEZONE } }
          },
          newCustomers: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = [];
    let totalReturningCustomers = 0;
    
    for (let i = 0; i < 6; i++) {
      const monthStart = istMonthStart(nowYear, nowMonth - 5 + i);
      const { year: y, month: m0 } = istMonthYear(monthStart);
      const m = m0 + 1;
      
      const newC = usersMonthly.find(x => x._id.year === y && x._id.month === m)?.newCustomers || 0;
      
      // Calculate true returning customers for this month (orders by users created before this month)
      const startOfMonth = monthStart;
      const endOfMonth = new Date(istMonthStart(y, m0 + 1).getTime() - 1);
      
      const returningOrdersAgg = await Order.aggregate([
        { $match: { isPaid: true, paidAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        { $match: { 'userInfo.createdAt': { $lt: startOfMonth } } },
        { $group: { _id: '$user' } }
      ]);
      const returningCustomersCount = returningOrdersAgg.length;
      totalReturningCustomers += returningCustomersCount;

      growthData.push({
        name: monthNames[m - 1],
        new: newC,
        returning: returningCustomersCount
      });
    }

    const segmentData = [
      { name: 'Daily Milk', value: await Subscription.countDocuments({ frequency: 'Daily' }), color: '#0D47A1' },
      { name: 'Alt Days', value: await Subscription.countDocuments({ frequency: 'Alternate Days' }), color: '#2E7D32' },
      { name: 'Weekend', value: await Subscription.countDocuments({ frequency: 'Weekly' }), color: '#D4AF37' },
      { name: 'Occasional', value: customers.length - await Subscription.countDocuments(), color: '#9CA3AF' }
    ];

    const totalSegments = segmentData.reduce((acc, s) => acc + (s.value < 0 ? 0 : s.value), 0) || 1;
    segmentData.forEach(s => {
      s.value = Math.max(0, Math.round((s.value / totalSegments) * 100));
    });

    const activeCustomerCount = customersWithStats.filter(c => c.status === 'Active' || c.status === 'VIP').length;
    const retentionRate = customers.length > 0 ? ((activeCustomerCount / customers.length) * 100).toFixed(1) : 0;

    res.json({
      topCustomers: customersWithStats,
      growthData,
      segmentData,
      stats: {
        totalCustomers: customers.length,
        newCustomers30d: customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length,
        retentionRate, 
        avgLTV: orderStats.length ? Math.round(orderStats.reduce((acc, s) => acc + s.lifetimeValue, 0) / orderStats.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = parseInt(year) || istMonthYear().year;

    // Indian calendar boundaries — the server runs in UTC.
    const startOfYear = istStartOfYear(selectedYear);
    const endOfYear = new Date(istStartOfYear(selectedYear + 1).getTime() - 1);

    // Revenue is money actually received: paid orders. Subscription revenue
    // is the orders the nightly engine generated and charged to the wallet.
    // It used to add each plan's price again on the day it was created, and
    // count the engine's orders as website sales, so every rupee from a plan
    // was counted twice under the wrong heading.
    const orders = await Order.find({
      isPaid: true,
      paidAt: { $gte: startOfYear, $lte: endOfYear }
    }).select('paidAt totalPrice orderSource subscription').lean();

    const bucketOf = (order) => (order.orderSource === 'POS' ? 'shop' : order.subscription ? 'sub' : 'web');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenueData = monthNames.map((m, index) => ({
      month: m,
      monthIndex: index,
      web: 0,
      shop: 0,
      sub: 0
    }));

    orders.forEach(order => {
      const { month } = istMonthYear(new Date(order.paidAt));
      monthlyRevenueData[month][bucketOf(order)] += order.totalPrice || 0;
    });

    const currentMonthIndex = istMonthYear().month;
    const currentMonthData = monthlyRevenueData[currentMonthIndex];
    const totalCurrentMonth = currentMonthData.web + currentMonthData.shop + currentMonthData.sub;
    
    const sourceData = [
      { name: 'Website Sales', value: currentMonthData.web, color: '#0D47A1' },
      { name: 'Shop POS', value: currentMonthData.shop, color: '#D4AF37' },
      { name: 'Subscriptions', value: currentMonthData.sub, color: '#2E7D32' }
    ].filter(s => s.value > 0);

    const todayStart = istStartOfDay();
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const sumPaid = async (from, to) => {
      const agg = await Order.aggregate([
        { $match: { isPaid: true, paidAt: { $gte: from, $lt: to } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      return agg[0]?.total || 0;
    };
    const revenueToday = await sumPaid(todayStart, istTomorrow());
    const revenueYesterday = await sumPaid(yesterdayStart, todayStart);
    
    const revenueThisYear = monthlyRevenueData.reduce((acc, m) => acc + m.web + m.shop + m.sub, 0);

    res.json({
      monthlyRevenueData,
      sourceData,
      stats: {
        revenueToday,
        revenueYesterday,
        revenueThisMonth: totalCurrentMonth,
        revenueThisYear
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['admin', 'manager', 'staff', 'superadmin'] } }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createWalletTransaction = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    if (!userId || !amount || !type || !description) return res.status(400).json({ message: 'Please provide all required fields' });
    if (type !== 'credit' && type !== 'debit') return res.status(400).json({ message: 'Type must be credit or debit' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactionAmount = Math.round(parseFloat(amount) * 100) / 100;
    if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Atomic, so it cannot race the nightly engine or a customer's own order.
    // A debit only applies while the balance still covers it.
    const updated = await User.findOneAndUpdate(
      type === 'debit'
        ? { _id: user._id, walletBalance: { $gte: transactionAmount } }
        : { _id: user._id },
      { $inc: { walletBalance: type === 'credit' ? transactionAmount : -transactionAmount } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    user.walletBalance = updated.walletBalance;

    const transaction = await WalletTransaction.create({
      user: user._id,
      amount: transactionAmount,
      type,
      description,
      balanceAfter: user.walletBalance,
      performedBy: req.user._id
    });

    res.status(201).json({ message: `Wallet ${type} successful`, walletBalance: user.walletBalance, transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Manually run the subscription engine.
 *
 * Recovery only: if the nightly run was missed — the service was down, a deploy
 * restarted it mid-round — an admin can replay it, optionally for a specific
 * date. Safe to call repeatedly: the engine's (subscription, deliveryDate)
 * guard means a day already processed is a no-op rather than a second charge.
 */
export const triggerSubscriptionEngine = async (req, res) => {
  try {
    const { date } = req.body || {};

    if (date && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'That date is not valid' });
    }

    const summary = await runSubscriptionEngine({ date: date ? new Date(date) : undefined });

    res.json({
      message: `Subscription engine run for ${summary.date}`,
      requestedBy: req.user?._id,
      today: istDateKey(),
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, billingCycle, isCreditCustomer, creditLimit, creditNotes } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const normPhone = phone ? normalisePhone(phone) : undefined;
    if (normPhone) {
      const existing = await User.findOne({ phone: normPhone });
      if (existing) {
        return res.status(400).json({ message: 'A customer with this phone number already exists' });
      }
    }

    const hasCredit = Boolean(isCreditCustomer) || (billingCycle && billingCycle !== 'none');

    const customerData = {
      name: name.trim(),
      address: address?.trim() || '',
      // POS customers never sign in with a password they were told, so give
      // each a random one rather than a shared default anyone could guess.
      password: crypto.randomBytes(24).toString('hex'),
      role: 'user',
      billingCycle: billingCycle || (hasCredit ? '15 Days' : 'none'),
      isCreditCustomer: hasCredit,
      creditLimit: Number(creditLimit) || 0,
      creditNotes: creditNotes?.trim() || ''
    };

    if (normPhone) customerData.phone = normPhone;
    if (email && typeof email === 'string' && email.trim()) {
      customerData.email = email.trim().toLowerCase();
    }

    const customer = new User(customerData);

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A customer with this ${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, billingCycle, isCreditCustomer, creditLimit, creditNotes } = req.body;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (phone !== undefined) {
      const normPhone = phone ? normalisePhone(phone) : undefined;
      customer.phone = normPhone || undefined;
    }
    if (email !== undefined) {
      customer.email = (email && typeof email === 'string' && email.trim()) ? email.trim().toLowerCase() : undefined;
    }
    if (address !== undefined) customer.address = address?.trim() || '';
    if (billingCycle !== undefined) {
      customer.billingCycle = billingCycle;
      if (billingCycle && billingCycle !== 'none') {
        customer.isCreditCustomer = true;
      }
    }
    if (isCreditCustomer !== undefined) customer.isCreditCustomer = Boolean(isCreditCustomer);
    if (creditLimit !== undefined) customer.creditLimit = Number(creditLimit) || 0;
    if (creditNotes !== undefined) customer.creditNotes = creditNotes?.trim() || '';

    await customer.save();
    res.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A customer with this ${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

