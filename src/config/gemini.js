const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('./env');

let model = null;

if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("✅ Gemini AI initialized");
} else {
  console.warn("⚠ GEMINI_API_KEY not set — AI features will use fallback responses");
}

module.exports = model;
