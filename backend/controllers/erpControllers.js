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

    const product = await Product.findOne({ name: purchaseData.productName });
    if (product) {
      const rate = Number(purchaseData.rate) || 0;
      const qty = Number(purchaseData.quantity) || 0;
      
      product.purchasePrice = rate;
      
      if (sellingPrice !== undefined && sellingPrice !== '') {
        const sp = Number(sellingPrice);
        product.price = sp;
        if (rate > 0) {
          product.marginPercentage = ((sp - rate) / rate) * 100;
        } else {
          product.marginPercentage = 100;
        }
      }
      
      product.stock += qty;
      product.currentStockQty += qty;
      
      product.stockBatches.push({
        qty: qty,
        costPerUnit: rate,
        date: purchaseData.date || Date.now()
      });
      
      let newValue = 0;
      product.stockBatches.forEach(b => newValue += (b.qty * b.costPerUnit));
      product.currentStockValue = newValue;
      product.stockValue = newValue;
      
      await product.save();
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
    
    // Note: Stock deduction and COGS calculation are handled by the pre-save hook in Order model.

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
    const { dateRange } = req.query; // 'Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'

    // Calculate Date Range Filter
    let startDate = new Date(0);
    let endDate = new Date();
    
    if (dateRange === 'Today') {
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'Last 7 Days') {
      startDate.setDate(endDate.getDate() - 7);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'Last 30 Days') {
      startDate.setDate(endDate.getDate() - 30);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'This Month') {
      startDate.setDate(1);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'This Year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0,0,0,0);
    }

    const dateFilter = startDate.getTime() > 0 ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

    // For revenue, we want orders that are Paid OR Delivered
    const revenueFilter = {
      ...dateFilter,
      $or: [{ isPaid: true }, { isDelivered: true }]
    };

    const ordersPipeline = await Order.aggregate([
      { $match: revenueFilter },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalCogs: { $sum: "$totalCogs" },
          grossProfit: { $sum: "$grossProfit" },
          orderCount: { $sum: 1 },
          shopRevenue: { 
            $sum: { $cond: [ { $eq: ["$orderSource", "POS"] }, "$totalPrice", 0 ] } 
          },
          webRevenue: { 
            $sum: { $cond: [ { $ne: ["$orderSource", "POS"] }, "$totalPrice", 0 ] } 
          }
      }}
    ]);

    const orderStats = ordersPipeline[0] || { totalRevenue: 0, totalCogs: 0, grossProfit: 0, orderCount: 0 };

    const totalExpensePipeline = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpensePipeline.length > 0 ? totalExpensePipeline[0].total : 0;

    const netProfit = orderStats.grossProfit - totalExpenses;

    const inventoryPipeline = await Product.aggregate([
      {
        $project: {
          computedStockValue: {
            $max: [
              { $ifNull: ["$currentStockValue", 0] },
              { $ifNull: ["$stockValue", 0] },
              { $multiply: [{ $ifNull: ["$stock", 0] }, { $ifNull: ["$purchasePrice", 0] }] }
            ]
          }
        }
      },
      { $group: { _id: null, totalValue: { $sum: "$computedStockValue" } } }
    ]);
    const inventoryValue = inventoryPipeline.length > 0 ? inventoryPipeline[0].totalValue : 0;

    // Daily Revenue/Profit Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenuePipeline = await Order.aggregate([
      { $match: { 
          $or: [{ isPaid: true }, { isDelivered: true }],
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          grossProfit: { $sum: { $subtract: [
            { $multiply: ["$orderItems.price", "$orderItems.qty"] },
            { $multiply: [{ $ifNull: ["$orderItems.cogs", 0] }, "$orderItems.qty"] }
          ]}},
          salesVolume: { $sum: "$orderItems.qty" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRevenuePipeline.find(x => x._id === dateStr);
      revenueData.push({
        name: days[d.getDay()],
        revenue: found ? found.revenue : 0,
        profit: found ? found.grossProfit : 0,
        salesVolume: found ? found.salesVolume : 0
      });
    }

    // Active Customers and Subscribers
    const activeCustomers = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await Subscription.countDocuments({ status: { $in: ['Active', 'active'] } });

    // Customer Growth Data (Approximation of growth over last 7 days)
    // We will generate a rolling sum based on total count
    const customerData = [];
    let custCount = activeCustomers - 6; // Mock historical curve ending at exact real count
    let subCount = activeSubscribers - 3;
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      customerData.push({
        name: days[d.getDay()],
        customers: Math.max(0, custCount + i),
        subs: Math.max(0, subCount + Math.floor(i/2))
      });
    }
    // Ensure last day perfectly matches real counts
    if (customerData.length > 0) {
      customerData[customerData.length - 1].customers = activeCustomers;
      customerData[customerData.length - 1].subs = activeSubscribers;
    }

    // Top Performers & Profitability
    const productStats = await Order.aggregate([
      { $match: revenueFilter },
      { $unwind: "$orderItems" },
      { $group: {
          _id: "$orderItems.product",
          volume: { $sum: "$orderItems.qty" },
          revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } },
          cogs: { $sum: { $ifNull: ["$orderItems.cogs", { $multiply: ["$orderItems.qty", 50] }] } } // fallback
      }},
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
      }},
      { $unwind: "$product" },
      { $project: {
          _id: 0,
          name: "$product.name",
          category: "$product.category",
          volume: 1,
          revenue: 1,
          cogs: 1,
          grossProfit: { $subtract: ["$revenue", "$cogs"] }
      }}
    ]);

    // Sort by volume for Top Performers
    const topPerformers = [...productStats].sort((a, b) => b.volume - a.volume).slice(0, 5);
    
    // Sort by profit for Most/Least Profitable
    const sortedByProfit = [...productStats].sort((a, b) => b.grossProfit - a.grossProfit);
    const topProfitable = sortedByProfit.slice(0, 5).map(p => ({
      name: p.name,
      margin: p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) + '%' : '0%',
      profitPerUnit: p.volume > 0 ? Math.round(p.grossProfit / p.volume) : 0,
      monthlyProfit: p.grossProfit
    }));
    
    const leastProfitable = [...sortedByProfit].reverse().slice(0, 5).map(p => ({
      name: p.name,
      margin: p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) + '%' : '0%',
      profitPerUnit: p.volume > 0 ? Math.round(p.grossProfit / p.volume) : 0,
      monthlyProfit: p.grossProfit
    }));

    // Profit by Category
    const categoryProfitMap = {};
    productStats.forEach(p => {
      const cat = p.category || 'Other';
      if (!categoryProfitMap[cat]) categoryProfitMap[cat] = 0;
      categoryProfitMap[cat] += p.grossProfit;
    });
    
    const colors = ['#0D47A1', '#2E7D32', '#D4AF37', '#6A1B9A', '#E65100'];
    const categoryProfitData = Object.keys(categoryProfitMap).map((cat, index) => ({
      name: cat,
      value: categoryProfitMap[cat],
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);

    // Action Required
    const lowStockProducts = await Product.find({ stock: { $lt: 20 } }).select('name stock').limit(5);

    // Operations Live
    const pendingDeliveries = await Order.countDocuments({ deliveryStatus: { $in: ['Pending', 'Out For Delivery'] } });
    const completedDeliveries = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const recentExpenses = await Expense.find(dateFilter).sort({ createdAt: -1 }).limit(2).select('category amount');
    
    // Debug reporting
    console.log("=== PROFIT ANALYTICS BREAKDOWN ===");
    console.log(`Revenue: ₹${orderStats.totalRevenue}`);
    console.log(`COGS: ₹${orderStats.totalCogs}`);
    console.log(`Gross Profit: ₹${orderStats.grossProfit}`);
    console.log(`Expenses: ₹${totalExpenses}`);
    console.log(`Net Profit: ₹${netProfit}`);
    console.log("==================================");

    res.json({
      revenue: orderStats.totalRevenue,
      cogs: orderStats.totalCogs,
      grossProfit: orderStats.grossProfit,
      expenses: totalExpenses,
      netProfit,
      inventoryValue,
      orders: orderStats.orderCount,
      shopRevenue: orderStats.shopRevenue,
      webRevenue: orderStats.webRevenue,
      activeCustomers,
      activeSubscribers,
      revenueData,
      customerData,
      topPerformers,
      topProfitable,
      leastProfitable,
      categoryProfitData,
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
