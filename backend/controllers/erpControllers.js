import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';
import Procurement from '../models/Procurement.js';
import Wastage from '../models/Wastage.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// --- PURCHASES ---
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({}).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { sellingPrice, ...purchaseData } = req.body;
    const purchase = new Purchase(purchaseData);
    const createdPurchase = await purchase.save();

    if (sellingPrice !== undefined && sellingPrice !== '') {
      const product = await Product.findOne({ name: purchaseData.productName });
      if (product) {
        const rate = Number(purchaseData.rate) || 0;
        const sp = Number(sellingPrice);
        product.purchasePrice = rate;
        product.price = sp;
        if (rate > 0) {
          product.marginPercentage = ((sp - rate) / rate) * 100;
        } else {
          product.marginPercentage = 100;
        }
        product.stock += Number(purchaseData.quantity) || 0;
        await product.save();
      }
    }

    res.status(201).json(createdPurchase);
  } catch (error) {
    res.status(400).json({ message: 'Invalid purchase data', error: error.message });
  }
};

// --- EXPENSES ---
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: 'Invalid expense data', error: error.message });
  }
};

// --- PROCUREMENT ---
export const getProcurements = async (req, res) => {
  try {
    const procurements = await Procurement.find({}).sort({ createdAt: -1 });
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProcurement = async (req, res) => {
  try {
    const procurement = new Procurement(req.body);
    const createdProcurement = await procurement.save();
    res.status(201).json(createdProcurement);
  } catch (error) {
    res.status(400).json({ message: 'Invalid procurement data', error: error.message });
  }
};

// --- WASTAGE ---
export const getWastages = async (req, res) => {
  try {
    const wastages = await Wastage.find({}).sort({ createdAt: -1 });
    res.json(wastages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createWastage = async (req, res) => {
  try {
    const wastage = new Wastage(req.body);
    const createdWastage = await wastage.save();
    res.status(201).json(createdWastage);
  } catch (error) {
    res.status(400).json({ message: 'Invalid wastage data', error: error.message });
  }
};

// --- ORDERS (POS) ---
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body };
    
    // Clean up product IDs from frontend if they include appended units (e.g. "64ac4...-1Litre")
    if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
      orderData.orderItems = orderData.orderItems.map(item => {
        let productId = item.product;
        if (typeof productId === 'string' && productId.includes('-')) {
          productId = productId.split('-')[0];
        }
        return { ...item, product: productId };
      });
    }

    // Auto-assign delivery boy based on shipping area
    if (orderData.shippingAddress && orderData.shippingAddress.city) {
      const area = orderData.shippingAddress.city;
      // Find an active delivery staff for this area
      const staff = await DeliveryStaff.findOne({ 
        area: { $regex: new RegExp(`^${area}$`, 'i') }, 
        status: 'Active' 
      });
      
      if (staff) {
        orderData.deliveryStaff = staff._id;
      }
    }

    const order = new Order(orderData);
    const createdOrder = await order.save();

    // Deduct stock for each item in the order
    if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
      for (const item of orderData.orderItems) {
        if (item.product) {
          try {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.qty }
            });
          } catch (err) {
            console.error(`Failed to deduct stock for product ${item.product}:`, err);
          }
        }
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

export const assignOrderToStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, deliveryBoyId } = req.body;
    
    const assignedId = staffId || deliveryBoyId;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryStaff = assignedId;
    order.deliveryStatus = 'Out For Delivery';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning order', error: error.message });
  }
};

// --- ANALYTICS DASHBOARD ---
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Simple aggregation for POC
    const totalOrders = await Order.countDocuments();
    const totalRevenuePipeline = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenuePipeline.length > 0 ? totalRevenuePipeline[0].total : 0;

    const totalExpensePipeline = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpensePipeline.length > 0 ? totalExpensePipeline[0].total : 0;

    const totalPurchasePipeline = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    const totalPurchases = totalPurchasePipeline.length > 0 ? totalPurchasePipeline[0].total : 0;

    const netProfit = totalRevenue - (totalExpenses + totalPurchases);

    // Revenue Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenuePipeline = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Map daily revenue to names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRevenuePipeline.find(x => x._id === dateStr);
      const rev = found ? found.revenue : 0;
      revenueData.push({
        name: days[d.getDay()],
        revenue: rev,
        profit: rev * 0.3, // Simple proxy for profit
        web: rev,
        shop: 0
      });
    }

    // Customer Growth (Last 5 Months)
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 4);
    fiveMonthsAgo.setDate(1);

    const usersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: fiveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          customers: { $sum: 1 }
        }
      }
    ]);

    const subsMonthly = await Subscription.aggregate([
      { $match: { createdAt: { $gte: fiveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          subs: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const customerData = [];
    let cumulativeCustomers = await User.countDocuments({ createdAt: { $lt: fiveMonthsAgo } });
    let cumulativeSubs = await Subscription.countDocuments({ createdAt: { $lt: fiveMonthsAgo } });

    for (let i = 0; i < 5; i++) {
      const d = new Date(fiveMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      
      const userCount = usersMonthly.find(x => x._id.year === y && x._id.month === m)?.customers || 0;
      const subCount = subsMonthly.find(x => x._id.year === y && x._id.month === m)?.subs || 0;
      
      cumulativeCustomers += userCount;
      cumulativeSubs += subCount;

      customerData.push({
        name: monthNames[m - 1],
        customers: cumulativeCustomers,
        subs: cumulativeSubs
      });
    }

    // Top Performers
    const topPerformersPipeline = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.name",
          volume: { $sum: "$orderItems.qty" },
          revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
        }
      },
      { $sort: { volume: -1 } },
      { $limit: 3 }
    ]);
    const topPerformers = topPerformersPipeline.map(item => ({
      name: item._id,
      volume: item.volume,
      revenue: item.revenue
    }));

    // Action Required
    const lowStockProducts = await Product.find({ stock: { $lt: 20 } }).select('name stock').limit(5);

    // Operations Live
    const pendingDeliveries = await Order.countDocuments({ deliveryStatus: { $in: ['Pending', 'Out For Delivery'] } });
    const completedDeliveries = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const recentExpenses = await Expense.find({}).sort({ createdAt: -1 }).limit(2).select('category amount');

    res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      purchases: totalPurchases,
      netProfit,
      orders: totalOrders,
      revenueData,
      customerData,
      topPerformers,
      actionRequired: lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
      operationsLive: {
        pendingDeliveries,
        completedDeliveries,
        totalDeliveries: pendingDeliveries + completedDeliveries,
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- DELIVERY STAFF ---
import DeliveryStaff from '../models/DeliveryStaff.js';

export const getDeliveryStaff = async (req, res) => {
  try {
    const staff = await DeliveryStaff.find({}).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createDeliveryStaff = async (req, res) => {
  try {
    const staff = new DeliveryStaff(req.body);
    const createdStaff = await staff.save();
    res.status(201).json(createdStaff);
  } catch (error) {
    res.status(400).json({ message: 'Invalid staff data', error: error.message });
  }
};

export const deleteDeliveryStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await DeliveryStaff.findOneAndDelete({ staffId: id });
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateStaffLocation = async (req, res) => {
  try {
    const { id } = req.params; // Using staffId for lookup
    const { lat, lng } = req.body;
    
    const staff = await DeliveryStaff.findOneAndUpdate(
      { staffId: id },
      { 
        location: {
          lat,
          lng,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
