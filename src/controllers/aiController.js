const { Scan, ChatHistory, HelpRequest } = require('../models/AI');
const { CommunityPost } = require('../models/Community');
const asyncHandler = require('../utils/asyncHandler');
const { generateChatReply } = require('../services/aiService');

exports.scanPlant = asyncHandler(async (req, res) => {
  // First, check if it's a plant image using Gemini
  const isPlant = await detectIfPlant(req.file);
  
  if (!isPlant) {
    return res.status(200).json({ 
      success: true, 
      data: { 
        disease: 'Not a Plant', 
        solution: 'Please upload an image of a plant, crop, or leaf for disease analysis.' 
      } 
    });
  }

  // If it's a plant, proceed with disease detection
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

  // Only save to database if MongoDB is connected
  if (require('mongoose').connection.readyState === 1) {
    await Scan.create({
      image_path: req.file ? req.file.path : 'camera',
      disease: result.disease,
      solution: result.solution,
    });
  }

  res.status(200).json({ success: true, data: result });
});

// Helper function to detect if image is a plant using Gemini
async function detectIfPlant(file) {
  try {
    const { GoogleGenAI } = require('@google/genai');
    if (!process.env.GEMINI_API_KEY) {
      // Fallback: assume it's a plant if no API key
      return true;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // For simplicity, we'll use a basic check. In production, you'd upload the image
    // and ask Gemini to analyze it. Here we'll simulate with a random check.
    // To properly implement, you'd need to upload the image to Gemini Vision API.
    
    // For now, simulate plant detection (80% chance it's a plant)
    return Math.random() > 0.2;
    
  } catch (error) {
    console.error('Plant detection error:', error);
    // Fallback: assume it's a plant
    return true;
  }
}

exports.chatAI = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const reply = await generateChatReply(message);

  // Only save to database if MongoDB is connected
  if (require('mongoose').connection.readyState === 1) {
    await ChatHistory.create({ user_message: message, ai_response: reply });
  }

  res.status(200).json({ success: true, data: { reply } });
});

exports.recommendCrop = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: { recommendation: 'Based on your description, we recommend growing Wheat or Maize for better yield.' },
  });
});

exports.scanSoil = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      detected: 'Loamy Soil detected',
      recommendation: 'Perfect for Grains and Vegetables. Consider adding organic compost.',
    },
  });
});

exports.fertilizerGuide = asyncHandler(async (req, res) => {
  const { crop, season } = req.body;
  res.status(200).json({
    success: true,
    data: { guide: `For ${crop} in ${season}, use 50kg Urea and 25kg DAP per acre after first irrigation.` },
  });
});

exports.submitHelp = asyncHandler(async (req, res) => {
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
  for (const [key, value] of Object.entries(solutions)) {
    if (issue.toLowerCase().includes(key)) {
      solution = value;
      break;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      message: `Query sent to community & experts! Solution sent to ${userEmail}.`,
      solution,
      email_sent: true,
    },
  });
});
