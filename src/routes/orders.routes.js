const router = require('express').Router();
const controller = require('../controllers/orders.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, controller.createOrder);
router.get('/buyer/orders', auth, controller.getBuyerOrders);
router.get('/farmer/orders', auth, controller.getFarmerOrders);
router.post('/status', auth, controller.updateOrderStatus);
router.post('/cancel', auth, controller.cancelOrder);

module.exports = router;
