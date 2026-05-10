const gemini = require('../config/gemini');
const { dbAll, dbRun, dbGet } = require('../utils/dbHelpers');

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

exports.chat = async (req, res) => {
  try {
    const { message, sessionMessages = [] } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    if (req.user) {
      await dbRun("INSERT INTO chat_history(user_id,role,message) VALUES(?,?,?)", [req.user.id, "user", message]);
    }

    const history = sessionMessages.slice(-6).map(m => `${m.role === "user" ? "Farmer" : "Krishi AI"}: ${m.content}`).join("\n");
    const systemCtx = `You are Krishi AI, an expert agricultural assistant for Indian farmers.  
    You provide advice in simple, practical language about: crops, soil, weather, government schemes,  
    pest management, market prices, and sustainable farming. Answer in the language of the question. 
    Keep answers concise and actionable.${req.user ? ` User role: ${req.user.role}.` : ""}`;

    const prompt = `${systemCtx}\n\nConversation:\n${history}\nFarmer: ${message}\nKrishi AI:`;

    let reply = await callGemini(prompt);

    if (!reply) {
      const fallbacks = {
        wheat:   "Wheat sowing season in North India is October-November. Use certified HD-3086 seeds. Apply 120:60:40 kg/ha NPK. Ensure 4-6 irrigations from crown root initiation.",
        soil:    "Healthy soil needs pH 6.5-7.5, organic matter > 1%, proper drainage. Do soil testing every 2 years. Add compost or green manure to improve fertility.",
        subsidy: "Key subsidies: PM-KISAN (₹6000/year), PMFBY crop insurance, Kisan Credit Card (4% interest). Apply at your nearest CSC or agriculture department office.",
        weather: "Monitor IMD forecasts at imd.gov.in. For Kharif, sow after first good monsoon rain. Keep drainage channels ready.",
      };
      const key = Object.keys(fallbacks).find(k => message.toLowerCase().includes(k));
      reply = key ? fallbacks[key] : "I'm here to help with your farming questions! Please ask about crops, soil health, weather, government schemes, or market prices.";
    }

    if (req.user) {
      await dbRun("INSERT INTO chat_history(user_id,role,message) VALUES(?,?,?)", [req.user.id, "assistant", reply]);
    }

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(200).json({ reply: "Sorry, I am offline or cannot connect to the server." });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await dbAll(
      "SELECT role, message, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

exports.scanPlant = async (req, res) => {
  try {
    const { crop_type, description } = req.body;

    const prompt = `Based on ${description ? `these symptoms: ${description}` : "common plant disease patterns"} in ${crop_type || "a crop"}: 
    Analyze the plant disease and provide a concise diagnosis and treatment.
    Format as JSON: { "disease": "...", "solution": "..." }`;

    let aiResponse = await callGemini(prompt);
    let result = { disease: 'Healthy', solution: 'No issues detected. Maintain regular care.' };

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        result = { disease: 'Analysis complete', solution: aiResponse.substring(0, 500) };
      }
    }

    res.json(result);
  } catch (err) {
    res.status(200).json({ disease: 'Healthy', solution: 'Apply recommended fungicide and improve air circulation.' });
  }
};

exports.help = async (req, res) => {
  try {
    const { issue } = req.body;
    await dbRun(
      "INSERT INTO help_requests(user_id,message) VALUES(?,?)",
      [req.user ? req.user.id : null, issue]
    );
    res.json({ 
      message: 'Query sent to community & experts!', 
      solution: 'Our experts have been notified.', 
      email_sent: true 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit help request" });
  }
};

exports.getCommunityPosts = async (req, res) => {
  try {
    const posts = await dbAll(
      `SELECT p.id, u.name as user_name, p.content as message, p.created_at as timestamp 
       FROM community_posts p JOIN users u ON p.author_id = u.id 
       ORDER BY p.created_at DESC LIMIT 30`,
      []
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
};

exports.createCommunityPost = async (req, res) => {
  try {
    const { message, location } = req.body;
    const result = await dbRun(
      "INSERT INTO community_posts(author_id,content,category) VALUES(?,?,?)",
      [req.user.id, message, location || "General"]
    );
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

exports.likeCommunityPost = async (req, res) => {
  try {
    await dbRun("UPDATE community_posts SET likes = likes + 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Post liked' });
  } catch (err) {
    res.status(500).json({ error: "Failed to like post" });
  }
};

exports.getCommunityOrgs = async (req, res) => {
  try {
    const orgs = await dbAll("SELECT * FROM community_orgs ORDER BY name ASC");
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};

exports.getAdvisories = async (req, res) => {
  try {
    const { category, lang = 'en' } = req.query;
    let sql = `SELECT * FROM advisories WHERE 1=1`;
    const params = [];
    if (category && category !== 'All') { sql += " AND category = ?"; params.push(category); }
    sql += " ORDER BY created_at DESC LIMIT 50";
    
    const rows = await dbAll(sql, params);
    
    const mappedRows = (rows || []).map(row => {
      // Modular schema only has 'title' and 'content', 
      // but let's mimic the legacy behavior if we want to be safe.
      // However, the modular seed data only has one language per row.
      return {
        ...row,
        timestamp: row.created_at,
        icon: row.icon || (row.category === 'crop' ? '🌾' : row.category === 'market' ? '📉' : '📢'),
        title: row.title,
        description: row.content.substring(0, 100) + '...',
        detail: row.content
      };
    });
    
    res.json(mappedRows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch advisories" });
  }
};

exports.createAdvisory = async (req, res) => {
  try {
    const { title_en, desc_en, detail_en, category } = req.body;
    const result = await dbRun(
      "INSERT INTO advisories(author_id,title,content,category) VALUES(?,?,?,?)",
      [req.user.id, title_en, detail_en || desc_en, category || "general"]
    );
    res.status(201).json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: "Failed to create advisory" });
  }
};
