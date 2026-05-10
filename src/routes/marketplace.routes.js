const router = require('express').Router();
const controller = require('../controllers/marketplace.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', controller.getMarketplace);
router.post('/products', auth, upload.single('productImage'), controller.createProduct);
router.get('/farmer/products', auth, controller.getFarmerProducts);
router.put('/products/:id', auth, controller.updateProduct);
router.delete('/products/:id', auth, controller.deleteProduct);

// Cart routes nested or adjacent
router.get('/cart', auth, controller.getCart);
router.post('/cart/add', auth, controller.addToCart);
router.put('/cart/:id', auth, controller.updateCartItem);
router.delete('/cart/:id', auth, controller.deleteCartItem);
router.delete('/cart', auth, controller.clearCart);

module.exports = router;
