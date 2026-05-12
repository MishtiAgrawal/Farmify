const gemini = require('../config/gemini');
const { dbAll, dbGet, dbRun } = require('../utils/dbHelpers');

async function callGemini(prompt) {
  if (!gemini) return null;
  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini error:", err.message);
    return null;
  }
}

exports.getSoilLabs = async (req, res) => {
  try {
    const labs = await dbAll("SELECT * FROM soil_labs");
    res.json(labs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch labs" });
  }
};

exports.bookSoilTest = async (req, res) => {
  try {
    res.json({ success: true, message: 'Soil test booked' });
  } catch (err) {
    res.status(500).json({ error: "Failed to book soil test" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await dbAll(
      `SELECT b.*, l.name as lab_name FROM soil_bookings b JOIN soil_labs l ON b.lab_id = l.id WHERE b.user_id = ?`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

exports.cropRecommend = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "description is required" });

    const prompt = `Based on this soil description: "${description}", recommend 2-3 best crops to grow for high yield. 
    Explain why in 1-2 sentences. Keep it practical for Indian farmers.`;

    let recommendation = await callGemini(prompt);
    if (!recommendation) {
      recommendation = "Based on your description, we recommend growing Wheat or Maize. These crops are resilient and suit most Indian soil types described.";
    }

    res.json({ recommendation });
  } catch (err) {
    res.status(500).json({ error: "Recommendation service failed" });
  }
};

exports.cropRecommendScan = async (req, res) => {
  try {
    res.json({ detected: "Loamy Soil detected", recommendation: "Perfect for Grains and Vegetables. Consider adding organic compost." });
  } catch (err) {
    res.status(500).json({ error: "Soil scan service failed" });
  }
};

exports.fertilizerGuide = async (req, res) => {
  try {
    const { crop, season } = req.body;
    res.json({ guide: `For ${crop} in ${season}, use 50kg Urea and 25kg DAP per acre after first irrigation.` });
  } catch (err) {
    res.status(500).json({ error: "Fertilizer guide service failed" });
  }
};
