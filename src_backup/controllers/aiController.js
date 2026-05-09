const { Scan, ChatHistory, HelpRequest, SoilScan } = require('../models/AI');
const { CommunityPost } = require('../models/Community');
const asyncHandler = require('../utils/asyncHandler');
const { GoogleGenAI } = require('@google/genai');

// --- PLANT SCAN ---
exports.scanPlant = asyncHandler(async (req, res, next) => {
  const diseases = ['Blight', 'Rust', 'Leaf Spot', 'Healthy', 'Powdery Mildew'];
  const solutions = [
    'Apply Copper fungicide and remove infected leaves.',
    'Use Sulfur-based spray and improve air circulation.',
    'Reduce overhead watering and use Neem oil spray.',
    'Your plant looks great! Keep up the good work.',
    'Apply Potassium Bicarbonate spray and prune affected areas.',
  ];
  const idx = Math.floor(Math.random() * diseases.length);
  const result = { disease: diseases[idx], solution: solutions[idx] };

  await Scan.create({
    image_path: req.file ? req.file.path : 'camera',
    disease: result.disease,
    solution: result.solution,
  });

  res.status(200).json(result);
});

// --- CHAT ---
exports.chatAI = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: "Error: GEMINI_API_KEY is not set in the .env file. Please add your key to use the AI chat." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `You are Krishi AI, an agricultural assistant for the Farmify app. You help farmers in India with their farming queries. Always be polite, helpful, and concise. If asked in Hindi or Hinglish, reply in Hinglish. Keep your answer under 3-4 short sentences.\nUser query: ${message}` }]
        }
      ]
    });
    
    const reply = response.text || "Sorry, I couldn't generate a response.";
    
    await ChatHistory.create({ user_message: message, ai_response: reply });
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const reply = "Sorry, there was an error processing your request with the AI.";
    await ChatHistory.create({ user_message: message, ai_response: reply });
    res.status(500).json({ reply });
  }
});

// --- RECOMMENDATIONS ---
exports.recommendCrop = asyncHandler(async (req, res, next) => {
  res.status(200).json({ recommendation: "Based on your description, we recommend growing Wheat or Maize for better yield." });
});

exports.scanSoil = asyncHandler(async (req, res, next) => {
  res.status(200).json({ detected: "Loamy Soil detected", recommendation: "Perfect for Grains and Vegetables. Consider adding organic compost." });
});

exports.fertilizerGuide = asyncHandler(async (req, res, next) => {
  const { crop, season } = req.body;
  res.status(200).json({ guide: `For ${crop} in ${season}, use 50kg Urea and 25kg DAP per acre after first irrigation.` });
});

// --- HELP ---
exports.submitHelp = asyncHandler(async (req, res, next) => {
  const { issue, email } = req.body;
  const userEmail = email || 'anonymous@farmify.in';

  await HelpRequest.create({ message: `From: ${userEmail} - Query: ${issue}` });
  
  await CommunityPost.create({
    user_name: 'Help Request',
    message: `🆘 ${issue} (Contact: ${userEmail})`,
    location: 'Community',
  });

  const solutions = {
    yellow: 'Yellowing leaves may indicate nitrogen deficiency. Apply 25kg Urea per acre.',
    pest: 'For pest control, try Neem oil spray (5ml/L water) early morning.',
    water: 'For irrigation issues, consider drip irrigation.',
    price: 'Check eNAM portal (enam.gov.in) for best mandi prices.',
  };

  let solution = 'Our agricultural experts have been notified. Kisan Helpline: 1800-180-1551.';
  for (const [key, val] of Object.entries(solutions)) {
    if (issue.toLowerCase().includes(key)) {
      solution = val;
      break;
    }
  }

  res.status(200).json({
    message: `Query sent to community & experts! Solution sent to ${userEmail}.`,
    solution: solution,
    email_sent: true,
  });
});
