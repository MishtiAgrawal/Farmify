const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, SALT_ROUNDS, JWT_EXPIRY } = require('../config/env');
const { dbGet, dbRun } = require('../utils/dbHelpers');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role = "farmer", phone, location } = req.body;
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role || 'farmer';

    const result = await dbRun(
      "INSERT INTO users(name,email,password,role,phone,location) VALUES(?,?,?,?,?,?)",
      [name, email, hashed, userRole, phone || null, location || null]
    );

    const token = jwt.sign({ id: result.lastID, role: userRole, name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, token, user: { id: result.lastID, name, role: userRole } });
  } catch (err) {
    res.status(400).json({ error: "Registration failed. Email might already exist." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.logout = async (req, res) => {
  try {
    await dbRun("INSERT INTO blacklisted_tokens(token) VALUES(?)", [req.token]);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await dbGet("SELECT id, name, email, role, phone, address, bio FROM users WHERE id = ?", [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await dbGet("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: "Current password incorrect" });

    const hashed = bcrypt.hashSync(newPassword, 10);
    await dbRun("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const row = await dbGet(
      `SELECT u.name, u.email, u.role, u.phone, u.address, u.bio, p.* 
       FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { phone, address, bio, farm_name, farm_size, soil_type, bank_account, aadhar, pan } = req.body;
    
    await dbRun('UPDATE users SET phone = ?, address = ?, bio = ? WHERE id = ?', [phone, address, bio, req.user.id]);
    
    const existing = await dbGet('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
    if (existing) {
      await dbRun(
        'UPDATE profiles SET farm_name = ?, farm_size = ?, soil_type = ?, bank_account = ?, aadhar = ?, pan = ? WHERE user_id = ?',
        [farm_name, farm_size, soil_type, bank_account, aadhar, pan, req.user.id]
      );
    } else {
      await dbRun(
        'INSERT INTO profiles (user_id, farm_name, farm_size, soil_type, bank_account, aadhar, pan) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, farm_name, farm_size, soil_type, bank_account, aadhar, pan]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
