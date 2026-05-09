const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res, next) => {
  const stats = {
    orders: 0,
    products: 0,
    revenue: 0,
    role: req.user.role,
  };

  if (req.user.role === 'farmer') {
    const farmerProducts = await Product.find({ farmer: req.user.id }).select('_id');
    const productIds = farmerProducts.map((product) => product._id);

    const orders = await Order.find({ product: { $in: productIds } });
    stats.products = farmerProducts.length;
    stats.orders = orders.length;
    stats.revenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
  } else {
    const orders = await Order.find({ buyer: req.user.id });
    stats.orders = orders.length;
    stats.revenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
  }

  res.status(200).json({ success: true, data: stats });
});
