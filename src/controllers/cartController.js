const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Cart = require('../models/Cart');

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({ success: true, data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, name, price, image, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: productId, name, price, image, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, name, price, image, quantity });
    }

    cart.updated_at = Date.now();
    await cart.save();
  }

  res.status(200).json({ success: true, data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    return next(new ErrorResponse('Cart item not found', 404));
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.updated_at = Date.now();
  await cart.save();

  res.status(200).json({ success: true, data: cart });
});

exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  cart.updated_at = Date.now();
  await cart.save();

  res.status(200).json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    cart.items = [];
    cart.updated_at = Date.now();
    await cart.save();
  }

  res.status(200).json({ success: true, data: cart });
});
