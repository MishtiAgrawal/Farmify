const mongoose = require('mongoose');

const AdvisorySchema = new mongoose.Schema({
  icon: String,
  category: String,
  title_en: String,
  title_hi: String,
  title_hinglish: String,
  desc_en: String,
  desc_hi: String,
  desc_hinglish: String,
  full_detail_en: String,
  full_detail_hi: String,
  full_detail_hinglish: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Advisory', AdvisorySchema);
