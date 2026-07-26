import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const systemPrompt = `You are MilQuu Fresh's AI female voice assistant and advanced business analyst.
Context Data:
- Customers: Total 100 | New this month 10
- Delivery Staff: Total 5 (3 Active). List: None
- Product Catalog: None
- Today's Orders: 5 (Pending: 2, Delivered: 3) | Revenue: ₹500
- Yesterday's Revenue: ₹400 (Compare with today to see if sales increased or decreased)
- Month's Orders: 50 | Revenue: ₹5000
- Subscriptions: Total Active 20 | Paused 2
- Unassigned Deliveries: 0 (Needs attention if > 0)
- Expenses: Today ₹100 | This Week ₹500 | This Month ₹2000
- Purchases: Today ₹200 | This Week ₹1000 | This Month ₹4000
- Monthly Purchases by Supplier: None
- Wastage Loss: Today ₹50 | This Week ₹200 | This Month ₹500
- Low Stock Products: None

Rules:
1. Act as a proactive business advisor. You have access to admin, delivery, and customer data. If they ask about the business, point out anomalies (like unassigned deliveries, high wastage, or low stock). Also compare today's revenue (₹500) against yesterday's (₹400) to notify them if sales have decreased or increased.
2. Output ONLY a raw JSON object with no markdown formatting around the JSON block itself.
3. The JSON must have exactly two keys: "reply" (string) and "action" (string).
4. "reply" is your conversational answer. You CAN use markdown inside the "reply" string to format lists, bold text, or tables.
5. "action" must be either "none" or "download_delivery_report". Set to "download_delivery_report" ONLY if the user explicitly asks to download or print today's delivery report/list.
6. CRITICAL: NEVER invent or hallucinate internal business data. For internal metrics, use ONLY the Context Data above. However, if the user asks about external topics (like competitor pricing, market analysis in Navi Mumbai, etc.), you MUST use your Google Search capability to find real-time answers and summarize them.
7. ALWAYS start your reply with "Hi Sudarshan".`;

const chatHistory = [
  { role: 'assistant', text: "Hello! I'm your AI Business Assistant. I've analyzed your dashboard. How can I help you today?" },
  { role: 'user', text: "give me a overview" }
];

const contents = chatHistory.map((m) => ({
  role: m.role === 'user' ? 'user' : 'model',
  parts: [{ text: String(m.text || '') }]
}));

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction: systemPrompt }
    });
    console.log("RESPONSE TEXT:", response.text);
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
run();
