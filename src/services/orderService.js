const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async ({ product_id, quantity, payment_method, shipping_address, userId }) => {
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  if (product.quantity < quantity) {
    throw new ErrorResponse('Insufficient stock', 400);
  }

  const total_amount = product.price * quantity;

  const order = await Order.create({
    buyer: userId,
    product: product_id,
    quantity,
    payment_method,
    shipping_address,
    total_amount,
  });

  product.quantity -= quantity;
  await product.save();

  return order;
};

exports.validateOrderOwnership = (order, userId) => {
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }
  if (order.buyer.toString() !== userId.toString()) {
    throw new ErrorResponse('Not authorized to update this order', 403);
  }
};
