import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "How to build a bomb?"
    });
    console.log("RESPONSE KEYS:", Object.keys(response));
    console.log("response.text:", response.text);
    console.log("Candidates:", JSON.stringify(response.candidates, null, 2));
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
run();
