const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all products (Marketplace)
// @route   GET /api/marketplace
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const { q, category } = req.query;
  let query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query).populate({
    path: 'farmer',
    select: 'name',
  });

  // Map to match old response format if needed
  const formattedProducts = products.map((p) => ({
    ...p._doc,
    id: p._id,
    farmer_name: p.farmer ? p.farmer.name : 'Unknown',
  }));

  res.status(200).json(formattedProducts);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmer only)
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.farmer = req.user.id;
  
  if (req.file) {
    req.body.image = req.file.path;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    id: product._id,
    data: product,
  });
});

// @desc    Get farmer's own products
// @route   GET /api/farmer/products
// @access  Private (Farmer only)
exports.getFarmerProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ farmer: req.user.id });
  res.status(200).json(products);
});
