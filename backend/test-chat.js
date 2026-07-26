import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const systemPrompt = `You are MilQuu Fresh's AI female voice assistant and advanced business analyst.
Context Data:
- Customers: Total 100 | New this month 10
- Today's Orders: 5 | Revenue: ₹500
- Yesterday's Revenue: ₹400

Rules:
1. Act as a proactive business advisor.
2. Output ONLY a raw JSON object with no markdown formatting around the JSON block itself.
3. The JSON must have exactly two keys: "reply" (string) and "action" (string).
`;

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: "hi" }] }],
    config: { systemInstruction: systemPrompt }
  });
  const rawText = (response.text || '').trim();
  console.log("RAW TEXT:", rawText);
  let parsed;
  try {
    parsed = JSON.parse(rawText.replace(/^```(json)?/i, '').replace(/```$/, '').trim());
    console.log("PARSED:", parsed);
  } catch (e) {
    console.log("PARSE ERROR:", e);
    parsed = { reply: rawText, action: 'none' };
  }
  console.log("FINAL REPLY:", parsed.reply || rawText);
}
run();
