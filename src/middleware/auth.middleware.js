const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { dbGet, dbRun } = require('../utils/dbHelpers');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];

    // Check blacklisted tokens (logout)
    const blacklisted = await dbGet("SELECT id FROM blacklisted_tokens WHERE token = ?", [token]);
    if (blacklisted) {
      return res.status(401).json({ error: "Token has been invalidated. Please login again." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please login again." });
  }
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
    }
    next();
  };
};
