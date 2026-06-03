import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Expense from '../models/Expense.js';
import Wastage from '../models/Wastage.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/business-update', protect, admin, async (req, res) => {
  try {
    // Get today's start and end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch metrics
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today, $lte: endOfDay }
    });

    const ordersData = await Order.find({
      createdAt: { $gte: today, $lte: endOfDay }
    });
    const revenueToday = ordersData.reduce((acc, order) => acc + order.totalAmount, 0);

    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
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
        console.error('AI Generation Error:', aiError);
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

export default router;

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
    
    // Get today's start and end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get this month's start
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch metrics
    const ordersToday = await Order.find({
      isPaid: true,
      paidAt: { $gte: today, $lte: endOfDay }
    });
    const revenueToday = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrdersTodayCount = ordersToday.length;

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

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

    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    });
    
    // Fetch anomalies for Dashboard Analysis
    const unassignedSubs = await Subscription.countDocuments({
      status: 'active',
      $or: [{ assignedStaff: null }, { assignedStaff: { $exists: false } }]
    });

    const expensesToday = await Expense.find({
      date: { $gte: today, $lte: endOfDay }
    });
    const totalExpenseToday = expensesToday.reduce((acc, ex) => acc + ex.amount, 0);

    const wastageToday = await Wastage.find({
      date: { $gte: today, $lte: endOfDay }
    });
    const totalWastageLoss = wastageToday.reduce((acc, w) => acc + (w.lossAmount || 0), 0);

    const lowStockProducts = await Product.find({ countInStock: { $lt: 20 } }).select('name countInStock');
    const lowStockList = lowStockProducts.map(p => `${p.name} (${p.countInStock} left)`).join(', ') || 'None';

    const fallbackResponse = {
      reply: "I'm sorry, I cannot process complex requests without my AI module configured.",
      action: "none"
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemPrompt = `You are MilQuu Fresh's AI female voice assistant and advanced business analyst.
Context Data:
- Today's Orders: ${totalOrdersTodayCount} | Revenue: ₹${revenueToday}
- Yesterday's Revenue: ₹${revenueYesterday} (Compare with today to see if sales increased or decreased)
- Month's Orders: ${totalOrdersMonthCount} | Revenue: ₹${revenueMonth}
- Active Subscriptions: ${activeSubscriptions}
- Unassigned Deliveries: ${unassignedSubs} (Needs attention if > 0)
- Today's Expenses: ₹${totalExpenseToday}
- Today's Wastage Loss: ₹${totalWastageLoss}
- Low Stock Products: ${lowStockList}

Rules:
1. Act as a proactive business advisor. If they ask about the business, point out anomalies (like unassigned deliveries, high wastage, or low stock). Also compare today's revenue (₹${revenueToday}) against yesterday's (₹${revenueYesterday}) to notify them if sales have decreased or increased.
2. Output ONLY a raw JSON object with no markdown formatting around the JSON block itself.
3. The JSON must have exactly two keys: "reply" (string) and "action" (string).
4. "reply" is your conversational answer. You CAN use markdown inside the "reply" string to format lists, bold text, or tables.
5. "action" must be either "none" or "download_delivery_report". Set to "download_delivery_report" ONLY if the user explicitly asks to download or print today's delivery report/list.
6. CRITICAL: NEVER invent, hallucinate, or make up data. Use ONLY the real-time Context Data provided above. If the revenue is 0, report it as 0. Do not invent fake products, sales, or metrics.`;

        // Format history for Gemini
        // Convert [{role: 'user', text: '...'}, {role: 'assistant', text: '...'}]
        // to [{role: 'user', parts: [{text: '...'}]}, {role: 'model', parts: [{text: '...'}]}]
        const formattedHistory = chatHistory.map((msg, i) => {
          let role = msg.role === 'assistant' ? 'model' : 'user';
          let text = msg.text;
          // Prepend system prompt to the first user message
          if (i === 0 && role === 'user') {
            text = systemPrompt + "\n\nUser Query: " + text;
          }
          return { role, parts: [{ text }] };
        });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedHistory,
        });
        
        // Try to parse the JSON response
        let jsonResponse;
        try {
          const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          jsonResponse = JSON.parse(text);
        } catch (parseError) {
          jsonResponse = { reply: response.text, action: "none" };
        }
        
        return res.json({ success: true, ...jsonResponse });
      } catch (aiError) {
        console.error('AI Generation Error:', aiError);
        return res.json({ success: true, ...fallbackResponse });
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
