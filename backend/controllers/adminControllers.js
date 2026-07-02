import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import generateToken from '../utils/generateToken.js';

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const usersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          newCustomers: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = [];
    let totalReturningCustomers = 0;
    
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      
      const newC = usersMonthly.find(x => x._id.year === y && x._id.month === m)?.newCustomers || 0;
      
      // Calculate true returning customers for this month (orders by users created before this month)
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);
      
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
    const selectedYear = parseInt(year) || new Date().getFullYear();

    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

    const orders = await Order.find({
      isPaid: true,
      paidAt: { $gte: startOfYear, $lte: endOfYear }
    });

    const subscriptions = await Subscription.find({
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenueData = monthNames.map((m, index) => ({
      month: m,
      monthIndex: index,
      web: 0,
      shop: 0,
      sub: 0
    }));

    orders.forEach(order => {
      const date = new Date(order.paidAt);
      const monthIndex = date.getMonth();
      if (order.orderSource === 'POS') {
        monthlyRevenueData[monthIndex].shop += order.totalPrice;
      } else {
        monthlyRevenueData[monthIndex].web += order.totalPrice;
      }
    });

    subscriptions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const monthIndex = date.getMonth();
      monthlyRevenueData[monthIndex].sub += sub.totalAmount || 0;
    });

    const currentMonthIndex = new Date().getMonth();
    const currentMonthData = monthlyRevenueData[currentMonthIndex];
    const totalCurrentMonth = currentMonthData.web + currentMonthData.shop + currentMonthData.sub;
    
    const sourceData = [
      { name: 'Website Sales', value: currentMonthData.web, color: '#0D47A1' },
      { name: 'Shop POS', value: currentMonthData.shop, color: '#D4AF37' },
      { name: 'Subscriptions', value: currentMonthData.sub, color: '#2E7D32' }
    ].filter(s => s.value > 0);

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23,59,59,999);

    const todayOrders = await Order.find({ isPaid: true, paidAt: { $gte: todayStart } });
    const todaySubs = await Subscription.find({ createdAt: { $gte: todayStart } });
    const revenueToday = todayOrders.reduce((acc, o) => acc + o.totalPrice, 0) + todaySubs.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

    const yesterdayOrders = await Order.find({ isPaid: true, paidAt: { $gte: yesterdayStart, $lte: yesterdayEnd } });
    const yesterdaySubs = await Subscription.find({ createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } });
    const revenueYesterday = yesterdayOrders.reduce((acc, o) => acc + o.totalPrice, 0) + yesterdaySubs.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    
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

    const transactionAmount = parseFloat(amount);
    if (type === 'debit' && user.walletBalance < transactionAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    if (type === 'credit') {
      user.walletBalance += transactionAmount;
    } else {
      user.walletBalance -= transactionAmount;
    }
    await user.save();

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
