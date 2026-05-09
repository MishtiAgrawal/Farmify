const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer only)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { product_id, quantity, payment_method, shipping_address } = req.body;

  const product = await Product.findById(product_id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.quantity < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  const total_amount = product.price * quantity;

  const order = await Order.create({
    buyer: req.user.id,
    product: product_id,
    quantity,
    payment_method,
    shipping_address,
    total_amount,
  });

  // Decrement stock
  product.quantity -= quantity;
  await product.save();

  res.status(201).json({
    success: true,
    id: order._id,
    data: order,
  });
});

// @desc    Get buyer's orders
// @route   GET /api/buyer/orders
// @access  Private (Buyer only)
exports.getBuyerOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ buyer: req.user.id })
    .populate('product')
    .sort('-timestamp');

  res.status(200).json(orders);
});

// @desc    Get farmer's orders
// @route   GET /api/farmer/orders
// @access  Private (Farmer only)
exports.getFarmerOrders = asyncHandler(async (req, res, next) => {
  // Find products belonging to this farmer
  const products = await Product.find({ farmer: req.user.id }).select('_id');
  const productIds = products.map((p) => p._id);

  const orders = await Order.find({ product: { $in: productIds } })
    .populate('product')
    .populate('buyer', 'name')
    .sort('-timestamp');

  res.status(200).json(orders);
});

// @desc    Update order status
// @route   POST /api/orders/status
// @access  Private (Farmer only)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { order_id, status } = req.body;

  const order = await Order.findById(order_id).populate('product');
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Verify farmer ownership
  if (order.product.farmer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this order', 403));
  }

  order.status = status;
  await order.save();

  res.status(200).json({ success: true });
});

// @desc    Cancel order
// @route   POST /api/orders/cancel
// @access  Private (Buyer only)
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { order_id } = req.body;

  const order = await Order.findOne({
    _id: order_id,
    buyer: req.user.id,
    status: 'pending',
  });

  if (!order) {
    return next(new ErrorResponse('Order cannot be cancelled', 400));
  }

  order.status = 'cancelled';
  await order.save();

  // Restore stock
  await Product.findByIdAndUpdate(order.product, {
    $inc: { quantity: order.quantity },
  });

  res.status(200).json({ success: true });
});

// @desc    Process payment
// @route   POST /api/payment/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  const { order_ids, payment_method } = req.body;

  // Simulate payment processing
  setTimeout(async () => {
    const transaction_id = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    await Order.updateMany(
      { _id: { $in: order_ids } },
      {
        payment_status: 'completed',
        transaction_id,
        status: 'confirmed',
      }
    );

    res.status(200).json({
      success: true,
      transaction_id,
      message: 'Payment processed successfully',
      payment_method,
    });
  }, 1000);
});
