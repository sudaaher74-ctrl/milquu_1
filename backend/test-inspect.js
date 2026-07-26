import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const systemPrompt = `You are a helpful assistant. Output JSON.`;

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'model', parts: [{ text: "Hello!" }] },
      { role: 'user', parts: [{ text: "hi" }] }
    ],
    config: { systemInstruction: systemPrompt }
  });
  console.log("RESPONSE KEYS:", Object.keys(response));
  console.log("response.text type:", typeof response.text);
  console.log("response.text value:", response.text);
}
run();
