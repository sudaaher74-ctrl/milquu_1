import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';
import Procurement from '../models/Procurement.js';
import Wastage from '../models/Wastage.js';
import Order from '../models/Order.js';

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
    const purchase = new Purchase(req.body);
    const createdPurchase = await purchase.save();
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
    const order = new Order(req.body);
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
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

    res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      purchases: totalPurchases,
      netProfit,
      orders: totalOrders
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
