const app = require('./app');
const { PORT } = require('./config/env');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = app.listen(PORT, () => {
  console.log(`
🚀 Farmify Backend v2.0
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
