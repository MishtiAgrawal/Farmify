const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user dashboard stats
// @route   GET /api/user/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  const stats = {
    orders: 0,
    products: 0,
    revenue: 0,
    role: req.user.role
  };

  if (req.user.role === 'farmer') {
    stats.products = await Product.countDocuments({ farmer: req.user.id });
    const orders = await Order.find({ 'items.farmer': req.user.id });
    stats.orders = orders.length;
    stats.revenue = orders.reduce((acc, order) => {
      const farmerItems = order.items.filter(item => item.farmer.toString() === req.user.id);
      return acc + farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);
  } else {
    stats.orders = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id });
    stats.revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0); // Total spent
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});
