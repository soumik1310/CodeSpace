require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

(async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
    const r = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: "Say hi" }] }],
    });
    console.log("OK:", r.text);
  } catch (e) {
    console.error("FAILED:", e.message);
  }
})();