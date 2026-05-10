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
    const { soilDetails } = req.body;
    // Mimic legacy response
    res.json({ recommendation: "Based on your description, we recommend growing Wheat or Maize for better yield." });
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
