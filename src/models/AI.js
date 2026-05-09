const mongoose = require('mongoose');

// Plant Scan Schema
const ScanSchema = new mongoose.Schema({
  image_path: String,
  disease: String,
  solution: String,
  timestamp: { type: Date, default: Date.now },
});

// Chat History Schema
const ChatHistorySchema = new mongoose.Schema({
  user_message: String,
  ai_response: String,
  timestamp: { type: Date, default: Date.now },
});

// Help Request Schema
const HelpRequestSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now },
});

// Soil Scan Schema
const SoilScanSchema = new mongoose.Schema({
  input_type: String,
  input_data: String,
  recommendation: String,
  timestamp: { type: Date, default: Date.now },
});

const Scan = mongoose.model('Scan', ScanSchema);
const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);
const HelpRequest = mongoose.model('HelpRequest', HelpRequestSchema);
const SoilScan = mongoose.model('SoilScan', SoilScanSchema);

module.exports = { Scan, ChatHistory, HelpRequest, SoilScan };
