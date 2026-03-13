import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY must be set in the environment");
}

export const gemini = new GoogleGenAI({ apiKey });

