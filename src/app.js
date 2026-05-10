require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files from 'public'
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Global rate limiting
app.use('/api', globalLimiter);

// API Routes
app.use('/api', routes);

// SPA Fallback: Serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

module.exports = app;
