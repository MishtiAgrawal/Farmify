const express = require('express');
const { getProducts, createProduct, getFarmerProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/marketplace', getProducts);
router.post('/products', protect, authorize('farmer'), upload.single('productImage'), createProduct);
router.get('/farmer/products', protect, authorize('farmer'), getFarmerProducts);

module.exports = router;
