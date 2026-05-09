const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrder } = require('../services/orderService');

exports.createOrder = asyncHandler(async (req, res, next) => {
  const order = await createOrder({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json({ success: true, data: order });
});

exports.getBuyerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user.id }).populate('product').sort('-timestamp');
  res.status(200).json({ success: true, data: orders });
});

exports.getFarmerOrders = asyncHandler(async (req, res) => {
  const farmerProducts = await Product.find({ farmer: req.user.id }).select('_id');
  const productIds = farmerProducts.map((product) => product._id);

  const orders = await Order.find({ product: { $in: productIds } })
    .populate('product')
    .populate('buyer', 'name')
    .sort('-timestamp');

  res.status(200).json({ success: true, data: orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { order_id, status } = req.body;
  const order = await Order.findById(order_id).populate('product');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (order.product.farmer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this order', 403));
  }

  order.status = status;
  await order.save();

  res.status(200).json({ success: true, data: order });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { order_id } = req.body;
  const order = await Order.findOne({ _id: order_id, buyer: req.user.id, status: 'pending' });

  if (!order) {
    return next(new ErrorResponse('Order cannot be cancelled', 400));
  }

  order.status = 'cancelled';
  await order.save();
  await Product.findByIdAndUpdate(order.product, { $inc: { quantity: order.quantity } });

  res.status(200).json({ success: true, data: order });
});

exports.processPayment = asyncHandler(async (req, res, next) => {
  const { order_ids, payment_method } = req.body;

  if (!Array.isArray(order_ids) || order_ids.length === 0) {
    return next(new ErrorResponse('At least one order ID is required', 400));
  }

  const transaction_id = `TXN${Date.now()}${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

  const updateResult = await Order.updateMany(
    { _id: { $in: order_ids }, buyer: req.user.id },
    {
      payment_status: 'completed',
      transaction_id,
      status: 'confirmed',
    }
  );

  if (!updateResult.matchedCount) {
    return next(new ErrorResponse('No valid orders found to process payment', 404));
  }

  res.status(200).json({
    success: true,
    transaction_id,
    payment_method,
    message: 'Payment processed successfully',
  });
});
