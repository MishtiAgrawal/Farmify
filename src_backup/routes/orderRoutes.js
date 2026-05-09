const express = require('express');
const { createOrder, getBuyerOrders, getFarmerOrders, updateOrderStatus, cancelOrder, processPayment } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/orders', authorize('buyer'), createOrder);
router.get('/buyer/orders', authorize('buyer'), getBuyerOrders);
router.post('/orders/cancel', authorize('buyer'), cancelOrder);

router.get('/farmer/orders', authorize('farmer'), getFarmerOrders);
router.post('/orders/status', authorize('farmer'), updateOrderStatus);

router.post('/payment/process', processPayment);

module.exports = router;
