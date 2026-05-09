const mongoose = require('mongoose');

// Mandi Price Schema
const MandiPriceSchema = new mongoose.Schema({
  crop: String,
  price: Number,
  change: String,
  market: String,
  timestamp: { type: Date, default: Date.now },
});

// Store Item Schema
const StoreItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  unit: String,
  icon: String,
  category: String,
});

// Soil Lab Schema
const SoilLabSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  services: String,
  website: String,
  email: String,
  testing_price: Number,
  turnaround_days: Number,
  accreditation: String,
  hours_of_operation: String,
  latitude: Number,
  longitude: Number,
});

// Soil Test Booking Schema
const SoilTestBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  lab: { type: mongoose.Schema.ObjectId, ref: 'SoilLab' },
  booking_date: { type: Date, default: Date.now },
  test_date: String,
  sample_type: String,
  field_size: Number,
  crop_type: String,
  status: { type: String, default: 'pending' },
  result_report: String,
  recommendations: String,
  cost: Number,
});

// Subsidy Schema
const SubsidySchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: String,
  benefit: String,
  link: String,
  eligibility: String,
  application_process: String,
  subsidy_amount: String,
  required_documents: String,
  contact_email: String,
  contact_phone: String,
  last_updated: { type: Date, default: Date.now },
});

// Subsidy Application Schema
const SubsidyApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  subsidy: { type: mongoose.Schema.ObjectId, ref: 'Subsidy' },
  application_date: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' },
  application_details: String,
  documents_uploaded: String,
  notes: String,
});

const MandiPrice = mongoose.model('MandiPrice', MandiPriceSchema);
const StoreItem = mongoose.model('StoreItem', StoreItemSchema);
const SoilLab = mongoose.model('SoilLab', SoilLabSchema);
const SoilTestBooking = mongoose.model('SoilTestBooking', SoilTestBookingSchema);
const Subsidy = mongoose.model('Subsidy', SubsidySchema);
const SubsidyApplication = mongoose.model('SubsidyApplication', SubsidyApplicationSchema);

module.exports = { MandiPrice, StoreItem, SoilLab, SoilTestBooking, Subsidy, SubsidyApplication };
