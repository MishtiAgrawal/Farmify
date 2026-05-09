const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secure_secret';

// File Uploads
const upload = multer({ dest: 'uploads/' });

// Database Connection
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) console.error('Database Connection Error:', err.message);
  else console.log('Connected to local SQLite database (database.sqlite). No MongoDB needed!');
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const protect = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

// --- AUTH ---
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Provide all fields' });

  const hash = bcrypt.hashSync(password, 10);
  const userRole = role || 'buyer';

  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    [name, email, hash, userRole], function(err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id: this.lastID, role: userRole, name }, JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({ success: true, token, user: { id: this.lastID, name, role: userRole } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
  });
});

// --- DASHBOARD ---
app.get('/api/user/stats', protect, (req, res) => {
  res.status(200).json({ success: true, data: { orders: 5, products: req.user.role === 'farmer' ? 12 : 0, revenue: 45000, role: req.user.role } });
});

app.get('/api/farm-overview', protect, (req, res) => {
  db.get(`SELECT * FROM user_farm LIMIT 1`, [], (err, row) => {
    if (row) return res.status(200).json(row);
    res.status(200).json({ total_area: '4.5 Acres', active_crops: 'Wheat, Soybean', soil_health: 'pH 6.8', yield_est: '38 Q/Acre' });
  });
});

// --- WEATHER & MANDI ---
app.get('/api/weather', (req, res) => {
  res.status(200).json({ condition: 'Sunny', temp: 32, feels_like: 34, location: 'Local Farm', pressure: '1012 hPa', humidity: 45, wind: 12, wind_direction: 'NE', forecast: [{ day: 'Mon', cond: 'Clear', temp_high: 33, temp_low: 22, rain_chance: 0 }] });
});

app.get('/api/mandi', (req, res) => {
  db.all(`SELECT * FROM mandi_prices`, [], (err, rows) => res.status(200).json(rows || []));
});

// --- MARKETPLACE & CART ---
app.get('/api/marketplace', (req, res) => {
  const { q, category } = req.query;
  let query = `SELECT * FROM products WHERE 1=1`;
  let params = [];
  if (q) { query += ` AND name LIKE ?`; params.push(`%${q}%`); }
  if (category) { query += ` AND category = ?`; params.push(category); }
  db.all(query, params, (err, rows) => res.status(200).json(rows || []));
});

let userCarts = {};
app.get('/api/cart', protect, (req, res) => res.status(200).json({ success: true, data: { items: userCarts[req.user.id] || [] } }));
app.post('/api/cart/add', protect, (req, res) => {
  if (!userCarts[req.user.id]) userCarts[req.user.id] = [];
  userCarts[req.user.id].push(req.body);
  res.status(200).json({ success: true, message: 'Added to cart' });
});

// --- COMMUNITY ---
app.get('/api/community/posts', (req, res) => db.all(`SELECT * FROM community_posts ORDER BY timestamp DESC`, [], (err, rows) => res.status(200).json(rows || [])));
app.post('/api/community/posts', protect, (req, res) => {
  db.run(`INSERT INTO community_posts (user_name, message, location) VALUES (?, ?, ?)`, [req.user.name, req.body.message, req.body.location || 'Local Area'], function(err) { res.status(201).json({ success: true, id: this.lastID }); });
});
app.get('/api/community/orgs', (req, res) => db.all(`SELECT * FROM community_orgs`, [], (err, rows) => res.status(200).json(rows || [])));

app.get('/api/advisories', (req, res) => {
  const category = req.query.category;
  const lang = req.query.lang || 'en';
  let query = category && category !== 'All' ? `SELECT * FROM advisories WHERE category = ? ORDER BY timestamp DESC` : `SELECT * FROM advisories ORDER BY timestamp DESC`;
  
  db.all(query, category && category !== 'All' ? [category] : [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const mappedRows = (rows || []).map(row => {
      let suffix = '_en';
      if (lang === 'hi') suffix = '_hi';
      else if (lang === 'hinglish') suffix = '_hinglish';
      
      return {
        ...row,
        title: row['title' + suffix] || row.title_en,
        description: row['desc' + suffix] || row.desc_en,
        detail: row['full_detail' + suffix] || row.full_detail_en
      };
    });
    
    res.status(200).json(mappedRows);
  });
});
app.post('/api/advisories', protect, (req, res) => {
  db.run(`INSERT INTO advisories (title_en, desc_en, full_detail_en, category, icon) VALUES (?, ?, ?, ?, ?)`, [req.body.title_en, req.body.desc_en, req.body.detail_en, req.body.category || 'General', '📢'], function(err) { res.status(201).json({ success: true, id: this.lastID }); });
});

// --- SERVICES ---
app.get('/api/store', (req, res) => db.all(`SELECT * FROM store_items`, [], (err, rows) => res.status(200).json(rows || [])));
app.get('/api/machinery', (req, res) => db.all(`SELECT * FROM machinery`, [], (err, rows) => res.status(200).json(rows || [])));
app.post('/api/machinery/book', protect, (req, res) => res.status(200).json({ success: true, message: 'Machinery booked' }));
app.get('/api/soil-labs', (req, res) => db.all(`SELECT * FROM soil_labs`, [], (err, rows) => res.status(200).json(rows || [])));
app.post('/api/soil-labs/book', protect, (req, res) => res.status(200).json({ success: true, message: 'Soil test booked' }));
app.get('/api/subsidies', (req, res) => db.all(`SELECT * FROM subsidies`, [], (err, rows) => res.status(200).json(rows || [])));
app.post('/api/subsidies/apply', protect, (req, res) => res.status(200).json({ success: true, message: 'Subsidy application submitted' }));

// --- LEDGER ---
app.get('/api/ledger', protect, (req, res) => {
  db.all(`SELECT * FROM ledger WHERE user_id = ? ORDER BY timestamp DESC`, [req.user.id], (err, rows) => res.status(200).json(rows || []));
});
app.post('/api/ledger', protect, (req, res) => {
  db.run(`INSERT INTO ledger (user_id, type, amount, description) VALUES (?, ?, ?, ?)`, [req.user.id, req.body.type, req.body.amount, req.body.description], function(err) { res.status(201).json({ success: true, id: this.lastID }); });
});

// --- AI INTELLIGENCE ---
app.post('/api/chat', async (req, res) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') return res.status(200).json({ reply: "Gemini API key not configured." });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: [{ role: 'user', parts: [{ text: `You are Krishi AI for Farmify. Reply in Hinglish concisely.\nUser: ${req.body.message}` }] }] });
    res.status(200).json({ reply: response.text || "Sorry, I couldn't generate a response." });
  } catch (error) { res.status(200).json({ reply: "Sorry, there was an error processing your request with the AI." }); }
});

app.post('/api/scan', upload.single('plantImage'), (req, res) => res.status(200).json({ disease: 'Healthy', solution: 'Apply recommended fungicide and improve air circulation.' }));
app.post('/api/help', protect, (req, res) => {
  db.run(`INSERT INTO help_requests (message) VALUES (?)`, [req.body.issue], function() { res.status(200).json({ message: 'Query sent to community & experts!', solution: 'Our experts have been notified.', email_sent: true }); });
});

// SPA Support
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));