const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const { buildProductQuery } = require('../services/productService');

exports.getProducts = asyncHandler(async (req, res) => {
  const query = buildProductQuery(req.query);
  const products = await Product.find(query).populate({ path: 'farmer', select: 'name' });

  const formattedProducts = products.map((product) => ({
    ...product.toObject(),
    id: product._id,
    farmer_name: product.farmer ? product.farmer.name : 'Unknown',
  }));

  res.status(200).json({ success: true, data: formattedProducts });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const productData = {
    ...req.body,
    farmer: req.user.id,
  };

  if (req.file) {
    productData.image = req.file.path;
  }

  const product = await Product.create(productData);

  res.status(201).json({ success: true, data: product });
});

exports.getFarmerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmer: req.user.id });
  res.status(200).json({ success: true, data: products });
});
