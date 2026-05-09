const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  payment_method: { type: String, default: 'card' },
  payment_status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  transaction_id: String,
  total_amount: { type: Number, required: true },
  shipping_address: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
