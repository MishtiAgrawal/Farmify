const express = require('express');
const {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder,
  processPayment,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  createOrderValidation,
  cancelOrderValidation,
  updateOrderStatusValidation,
  processPaymentValidation,
} = require('../utils/validationSchemas');

const router = express.Router();
router.use(protect);

router.post('/orders', authorize('buyer'), createOrderValidation, validateRequest, createOrder);
router.get('/buyer/orders', authorize('buyer'), getBuyerOrders);
router.post('/orders/cancel', authorize('buyer'), cancelOrderValidation, validateRequest, cancelOrder);

router.get('/farmer/orders', authorize('farmer'), getFarmerOrders);
router.post('/orders/status', authorize('farmer'), updateOrderStatusValidation, validateRequest, updateOrderStatus);

router.post('/payment/process', authorize('buyer'), processPaymentValidation, validateRequest, processPayment);

module.exports = router;
