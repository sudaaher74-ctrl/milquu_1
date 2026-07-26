import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const systemPrompt = `You are MilQuu Fresh's AI female voice assistant and advanced business analyst.
Context Data:
- Customers: Total 100 | New this month 10
- Today's Orders: 0 (Pending: 0, Delivered: 0) | Revenue: ₹0
- Yesterday's Revenue: ₹0 (Compare with today to see if sales increased or decreased)
- Month's Orders: 0 | Revenue: ₹0
- Subscriptions: Total Active 0 | Paused 0
- Unassigned Deliveries: 0 (Needs attention if > 0)
- Expenses: Today ₹0 | This Week ₹0 | This Month ₹0
- Purchases: Today ₹0 | This Week ₹0 | This Month ₹0
- Monthly Purchases by Supplier: None
- Wastage Loss: Today ₹0 | This Week ₹0 | This Month ₹0
- Low Stock Products: None

Rules:
1. Act as a proactive business advisor. You have access to admin, delivery, and customer data. If they ask about the business, point out anomalies (like unassigned deliveries, high wastage, or low stock). Also compare today's revenue (₹0) against yesterday's (₹0) to notify them if sales have decreased or increased.
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
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: { systemInstruction: systemPrompt }
  });
  console.log("RESPONSE TEXT:", response.text);
}
run();
