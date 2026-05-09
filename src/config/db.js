const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in environment variables');
    console.log('ℹ️  Server will continue without database connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('ℹ️  Server will continue with limited functionality');
    console.log('👉 Update MONGODB_URI in .env to a valid MongoDB connection string for full functionality');
  }
};

module.exports = connectDB;
