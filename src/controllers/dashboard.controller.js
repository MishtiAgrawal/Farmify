const { dbAll, dbGet, dbRun } = require('../utils/dbHelpers');

exports.getStats = async (req, res) => {
  try {
    // Mimic legacy response
    res.json({ success: true, data: { orders: 5, products: req.user.role === 'farmer' ? 12 : 0, revenue: 45000, role: req.user.role } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

exports.getFarmOverview = async (req, res) => {
  try {
    const row = await dbGet(`SELECT total_land as total_area, active_crops, soil_health, yield_estimate as yield_est FROM farm_overview WHERE user_id = ?`, [req.user.id]);
    if (row) return res.json(row);
    // Fallback default
    res.json({ total_area: '4.5 Acres', active_crops: 'Wheat, Soybean', soil_health: 'pH 6.8', yield_est: '38 Q/Acre' });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

exports.updateFarmOverview = async (req, res) => {
  try {
    const { total_area, active_crops, soil_health, yield_est } = req.body;
    const existing = await dbGet('SELECT id FROM farm_overview WHERE user_id = ?', [req.user.id]);
    if (existing) {
      await dbRun(
        'UPDATE farm_overview SET total_land=?, active_crops=?, soil_health=?, yield_estimate=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?',
        [total_area, active_crops, soil_health, yield_est, req.user.id]
      );
    } else {
      await dbRun(
        'INSERT INTO farm_overview (user_id, total_land, active_crops, soil_health, yield_estimate) VALUES (?,?,?,?,?)',
        [req.user.id, total_area, active_crops, soil_health, yield_est]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update overview" });
  }
};

exports.getWeather = async (req, res) => {
  try {
    // Static response matching legacy exactly
    res.json({ 
        condition: 'Sunny', 
        temp: 32, 
        feels_like: 34, 
        location: 'Local Farm', 
        pressure: '1012 hPa', 
        humidity: 45, 
        wind: 12, 
        wind_direction: 'NE', 
        forecast: [
            { day: 'Mon', cond: 'Clear', temp_high: 33, temp_low: 22, rain_chance: 0 },
            { day: 'Tue', cond: 'Cloudy', temp_high: 30, temp_low: 24, rain_chance: 20 },
            { day: 'Wed', cond: 'Rainy', temp_high: 28, temp_low: 23, rain_chance: 60 }
        ] 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
};

exports.getMandi = async (req, res) => {
  try {
    const rows = [
        { crop: 'Wheat (Gehun)', price: 2340, change: '↑ +80', market: 'Indore' },
        { crop: 'Soybean', price: 4620, change: '↑ +180', market: 'Indore' },
        { crop: 'Maize (Makka)', price: 1890, change: '↓ -40', market: 'Bhopal' },
        { crop: 'Cotton (Kapas)', price: 6150, change: '↑ +120', market: 'Nagpur' },
        { crop: 'Gram (Chana)', price: 5210, change: '↓ -90', market: 'Indore' }
    ];
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mandi prices" });
  }
};

exports.getStore = async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM store_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch store items" });
  }
};
