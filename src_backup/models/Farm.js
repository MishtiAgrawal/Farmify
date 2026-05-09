const mongoose = require('mongoose');

// User Farm Schema
const UserFarmSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  total_area: String,
  active_crops: String,
  soil_health: String,
  yield_est: String,
});

// Machinery Schema
const MachinerySchema = new mongoose.Schema({
  name: String,
  type: String,
  price_per_hour: Number,
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: { type: String, default: 'available' },
  location: String,
  description: String,
});

// Machinery Booking Schema
const MachineryBookingSchema = new mongoose.Schema({
  machinery: { type: mongoose.Schema.ObjectId, ref: 'Machinery' },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  booking_date: String,
  hours: Number,
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

// Ledger Schema
const LedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  type: String, // income/expense
  amount: Number,
  category: String,
  description: String,
  timestamp: { type: Date, default: Date.now },
});

const UserFarm = mongoose.model('UserFarm', UserFarmSchema);
const Machinery = mongoose.model('Machinery', MachinerySchema);
const MachineryBooking = mongoose.model('MachineryBooking', MachineryBookingSchema);
const Ledger = mongoose.model('Ledger', LedgerSchema);

module.exports = { UserFarm, Machinery, MachineryBooking, Ledger };
