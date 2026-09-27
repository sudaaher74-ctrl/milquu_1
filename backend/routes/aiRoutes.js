import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Expense from '../models/Expense.js';
import Wastage from '../models/Wastage.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { istStartOfDay, istTomorrow, istStartOfMonth, istDayOfWeek } from '../utils/ist.js';

const router = express.Router();

router.get('/business-update', protect, admin, async (req, res) => {
  try {
    // Today, as an Indian calendar day (the server runs in UTC)
    const today = istStartOfDay();
    const endOfDay = new Date(istTomorrow().getTime() - 1);

    // Fetch metrics
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today, $lte: endOfDay }
    });

    // Orders carry totalPrice; reading totalAmount made this NaN.
    const paidToday = await Order.find({
      isPaid: true,
      paidAt: { $gte: today, $lte: endOfDay }
    }).select('totalPrice');
    const revenueToday = paidToday.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    const activeSubscriptions = await Subscription.countDocuments({
      status: { $in: ['Active', 'active'] }
    });

    // Generate fallback template string
    const fallbackText = `Here is your business update for today. You have received ${ordersToday} new orders, generating a total revenue of ${revenueToday} rupees. You currently have ${activeSubscriptions} active subscriptions. Keep up the good work!`;

    // Check if Gemini API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an AI business assistant for MilQuu Fresh, a milk delivery service. Generate a brief, conversational, and energetic voice update (max 3 sentences) for the store admin based on these metrics: Today's Orders: ${ordersToday}, Today's Revenue: ₹${revenueToday}, Active Subscriptions: ${activeSubscriptions}. Make it sound natural when spoken out loud.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        return res.json({ success: true, text: response.text });
      } catch (aiError) {
        console.error('AI Generation Error Details:', {
          message: aiError.message,
          status: aiError.status
        });
        
        if (aiError.message && aiError.message.includes('User location is not supported')) {
          console.warn("WARN: Gemini API is restricted in the server's current deployment region. Falling back to rule-based responses.");
        }
        
        return res.json({ success: true, text: fallbackText });
      }
    } else {
      // Return fallback text if no API key
      return res.json({ success: true, text: fallbackText });
    }

  } catch (error) {
    console.error('Business Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/chat', protect, admin, async (req, res) => {
  try {
    const { query, messages } = req.body;
    
    // Construct message history
    let chatHistory = [];
    if (messages && Array.isArray(messages)) {
      chatHistory = messages;
    } else if (query) {
      chatHistory = [{ role: 'user', text: query }];
    } else {
      return res.status(400).json({ success: false, message: 'No input provided' });
    }
    
    // Indian calendar boundaries (the server runs in UTC)
    const DAY = 24 * 60 * 60 * 1000;
    const today = istStartOfDay();
    const endOfDay = new Date(istTomorrow().getTime() - 1);

    // Get this month's start
    const startOfMonth = istStartOfMonth();

    // Get this week's start (Sunday)
    const startOfWeek = new Date(today.getTime() - istDayOfWeek() * DAY);

    // Fetch metrics
    const ordersToday = await Order.find({
      isPaid: true,
      paidAt: { $gte: today, $lte: endOfDay }
    });
    const revenueToday = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrdersTodayCount = ordersToday.length;

    const yesterdayStart = new Date(today.getTime() - DAY);
    const yesterdayEnd = new Date(today.getTime() - 1);

    const ordersYesterday = await Order.find({
      isPaid: true,
      paidAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });
    const revenueYesterday = ordersYesterday.reduce((acc, order) => acc + order.totalPrice, 0);

    const ordersMonth = await Order.find({
      isPaid: true,
      paidAt: { $gte: startOfMonth, $lte: endOfDay }
    });
    const revenueMonth = ordersMonth.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrdersMonthCount = ordersMonth.length;

    // Fetch anomalies for Dashboard Analysis
    const unassignedSubs = await Subscription.countDocuments({
      status: { $in: ['Active', 'active'] },
      $or: [{ assignedStaff: null }, { assignedStaff: { $exists: false } }]
    });

    const expensesMonthData = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfDay }
    });
    const totalExpenseToday = expensesMonthData.filter(e => new Date(e.date) >= today).reduce((acc, ex) => acc + ex.amount, 0);
    const totalExpenseWeek = expensesMonthData.filter(e => new Date(e.date) >= startOfWeek).reduce((acc, ex) => acc + ex.amount, 0);
    const totalExpenseMonth = expensesMonthData.reduce((acc, ex) => acc + ex.amount, 0);

    const wastageMonthData = await Wastage.find({
      date: { $gte: startOfMonth, $lte: endOfDay }
    });
    const totalWastageLossToday = wastageMonthData.filter(w => new Date(w.date) >= today).reduce((acc, w) => acc + (w.lossValue || 0), 0);
    const totalWastageLossWeek = wastageMonthData.filter(w => new Date(w.date) >= startOfWeek).reduce((acc, w) => acc + (w.lossValue || 0), 0);
    const totalWastageLossMonth = wastageMonthData.reduce((acc, w) => acc + (w.lossValue || 0), 0);

    const purchaseMonthData = await Purchase.find({
      date: { $gte: startOfMonth, $lte: endOfDay }
    });
    const totalPurchaseToday = purchaseMonthData.filter(p => new Date(p.date) >= today).reduce((acc, p) => acc + p.totalCost, 0);
    const totalPurchaseWeek = purchaseMonthData.filter(p => new Date(p.date) >= startOfWeek).reduce((acc, p) => acc + p.totalCost, 0);
    const totalPurchaseMonth = purchaseMonthData.reduce((acc, p) => acc + p.totalCost, 0);

    const supplierSummary = purchaseMonthData.reduce((acc, p) => {
      acc[p.supplierName] = (acc[p.supplierName] || 0) + p.totalCost;
      return acc;
    }, {});
    const topSuppliersList = Object.entries(supplierSummary)
      .map(([name, cost]) => `${name} (₹${cost})`)
      .join(', ') || 'None';

    const lowStockProducts = await Product.find({ stock: { $lt: 20 } }).select('name stock');
    const lowStockList = lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ') || 'None';

    // -- Customer Data --
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth, $lte: endOfDay }
    });

    // -- Delivery Staff Data --
    const deliveryStaff = await DeliveryStaff.find({});
    const totalDeliveryStaff = deliveryStaff.length;
    const activeDeliveryStaff = deliveryStaff.filter(s => s.status === 'Active').length;
    const deliveryStaffList = deliveryStaff.map(s => `${s.name} (${s.status}, ${s.area})`).join(', ') || 'None';

    // -- Product Catalog --
    const allProducts = await Product.find({});
    const productCatalog = allProducts.map(p => `${p.name} (₹${p.price}/${p.unit}, Stock: ${p.stock || p.countInStock || 0})`).join(' | ') || 'None';

    // -- Orders Summary --
    const ordersTodayList = await Order.find({
      createdAt: { $gte: today, $lte: endOfDay }
    });
    const pendingOrdersToday = ordersTodayList.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const deliveredOrdersToday = ordersTodayList.filter(o => o.status === 'Delivered').length;

    // -- Subscription Summary --
    const allSubscriptions = await Subscription.find({});
    const totalActiveSubs = allSubscriptions.filter(s => s.status === 'Active').length;
    const totalPausedSubs = allSubscriptions.filter(s => s.status === 'Paused').length;

    const fallbackResponse = {
      reply: "I'm sorry, my AI module isn't configured yet! Since this is the live website, you need to go to your Render.com dashboard, find your Web Service, and add `GEMINI_API_KEY` to the Environment Variables.",
      action: "none"
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Greet whoever is signed in, not a name baked into the prompt.
        const adminFirstName = String(req.user?.name || 'there').trim().split(/\s+/)[0];
        const systemPrompt = `You are MilQuu Fresh's AI female voice assistant and advanced business analyst.
Context Data:
- Customers: Total ${totalCustomers} | New this month ${newCustomersThisMonth}
- Delivery Staff: Total ${totalDeliveryStaff} (${activeDeliveryStaff} Active). List: ${deliveryStaffList}
- Product Catalog: ${productCatalog}
- Today's Orders: ${totalOrdersTodayCount} (Pending: ${pendingOrdersToday}, Delivered: ${deliveredOrdersToday}) | Revenue: ₹${revenueToday}
- Yesterday's Revenue: ₹${revenueYesterday} (Compare with today to see if sales increased or decreased)
- Month's Orders: ${totalOrdersMonthCount} | Revenue: ₹${revenueMonth}
- Subscriptions: Total Active ${totalActiveSubs} | Paused ${totalPausedSubs}
- Unassigned Deliveries: ${unassignedSubs} (Needs attention if > 0)
- Expenses: Today ₹${totalExpenseToday} | This Week ₹${totalExpenseWeek} | This Month ₹${totalExpenseMonth}
- Purchases: Today ₹${totalPurchaseToday} | This Week ₹${totalPurchaseWeek} | This Month ₹${totalPurchaseMonth}
- Monthly Purchases by Supplier: ${topSuppliersList}
- Wastage Loss: Today ₹${totalWastageLossToday} | This Week ₹${totalWastageLossWeek} | This Month ₹${totalWastageLossMonth}
- Low Stock Products: ${lowStockList}

Rules:
1. Act as a proactive business advisor. You have access to admin, delivery, and customer data. If they ask about the business, point out anomalies (like unassigned deliveries, high wastage, or low stock). Also compare today's revenue (₹${revenueToday}) against yesterday's (₹${revenueYesterday}) to notify them if sales have decreased or increased.
2. Output ONLY a raw JSON object with no markdown formatting around the JSON block itself.
3. The JSON must have exactly two keys: "reply" (string) and "action" (string).
4. "reply" is your conversational answer. You CAN use markdown inside the "reply" string to format lists, bold text, or tables.
5. "action" must be either "none" or "download_delivery_report". Set to "download_delivery_report" ONLY if the user explicitly asks to download or print today's delivery report/list.
6. CRITICAL: NEVER invent or hallucinate internal business data. For internal metrics, use ONLY the Context Data above. You have no live internet access: for external topics (competitor pricing, market trends), say so and offer general guidance only, clearly labelled as such.
7. ALWAYS start your reply with "Hi ${adminFirstName}".`;

        // Call Gemini from the server — the API key must never be sent to the browser
        const contents = chatHistory.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || '') }]
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: { systemInstruction: systemPrompt }
        });

        const rawText = (response.text || '').trim();
        let parsed;
        try {
          parsed = JSON.parse(rawText.replace(/^```(json)?/i, '').replace(/```$/, '').trim());
        } catch {
          parsed = { reply: rawText, action: 'none' };
        }

        return res.json({
          success: true,
          reply: parsed.reply || rawText,
          action: parsed.action === 'download_delivery_report' ? 'download_delivery_report' : 'none'
        });

      } catch (error) {
        console.error('Gemini Context Error Details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });

        if (error.message && error.message.includes('User location is not supported')) {
          console.warn("WARN: Gemini API is restricted in the server's current deployment region (e.g., Render EU region). Returning fallback response.");
          return res.json({ 
            success: true, 
            reply: "I am having trouble connecting to my AI brain. The server is deployed in a region where the Gemini API is currently restricted. To fix this, change your hosting region (e.g., Render) to a supported region like US Oregon.", 
            action: "none" 
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to communicate with AI provider'
        });
      }
    } else {
      // Basic rule-based fallback if no Gemini
      let action = 'none';
      let reply = "I heard you, but I need Gemini API to understand properly.";
      const lastMsg = chatHistory[chatHistory.length - 1];
      const q = (lastMsg?.text || '').toLowerCase();
      
      if (q.includes('download') || q.includes('report') || q.includes('delivery')) {
        action = 'download_delivery_report';
        reply = "Downloading today's delivery report for you right away.";
      } else if (q.includes('today') && q.includes('sale')) {
        reply = `Today's sales are ${revenueToday} rupees from ${totalOrdersTodayCount} orders.`;
      } else if (q.includes('month') && q.includes('sale')) {
        reply = `This month's sales are ${revenueMonth} rupees.`;
      } else if (q.includes('dashboard') || q.includes('overview') || q.includes('error')) {
         reply = `**Business Overview:**\n- Revenue Today: ₹${revenueToday}\n- Unassigned Deliveries: ${unassignedSubs}\n- Low Stock: ${lowStockList}`;
      }
      
      return res.json({ success: true, reply, action });
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
