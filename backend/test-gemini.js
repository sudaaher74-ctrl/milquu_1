import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'say hi',
}).then(res => {
  console.log('Keys in res:', Object.keys(res));
  console.log('res.text properties:', res.text);
}).catch(console.error);
