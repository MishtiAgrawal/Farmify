const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Please ensure MongoDB is installed and running locally, or update MONGODB_URI in .env to a valid MongoDB Atlas cluster.');
    process.exit(1);
  }
};

module.exports = connectDB;
