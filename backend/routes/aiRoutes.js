import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
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
    const { query } = req.body;
    
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

    const ordersMonth = await Order.find({
      isPaid: true,
      paidAt: { $gte: startOfMonth, $lte: endOfDay }
    });
    const revenueMonth = ordersMonth.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrdersMonthCount = ordersMonth.length;

    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    });

    const fallbackResponse = {
      reply: "I'm sorry, I cannot process complex requests without my AI module configured.",
      action: "none"
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemPrompt = `You are MilQuu Fresh's AI female voice assistant. You receive a spoken query from the admin and output JSON.
Context Data:
- Today's Orders: ${totalOrdersTodayCount}
- Today's Revenue: ₹${revenueToday}
- This Month's Orders: ${totalOrdersMonthCount}
- This Month's Revenue: ₹${revenueMonth}
- Active Subscriptions: ${activeSubscriptions}

Rules:
1. Output ONLY a raw JSON object with no markdown formatting.
2. The JSON must have exactly two keys: "reply" (string) and "action" (string).
3. "reply" is the conversational answer to be spoken aloud. Make it brief and professional but friendly.
4. "action" must be either "none" or "download_delivery_report". Set to "download_delivery_report" ONLY if the user explicitly asks to download or print today's delivery report/list.

User Query: "${query}"`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
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
      const q = query.toLowerCase();
      
      if (q.includes('download') || q.includes('report') || q.includes('delivery')) {
        action = 'download_delivery_report';
        reply = "Downloading today's delivery report for you right away.";
      } else if (q.includes('today') && q.includes('sale')) {
        reply = `Today's sales are ${revenueToday} rupees from ${totalOrdersTodayCount} orders.`;
      } else if (q.includes('month') && q.includes('sale')) {
        reply = `This month's sales are ${revenueMonth} rupees.`;
      }
      
      return res.json({ success: true, reply, action });
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
