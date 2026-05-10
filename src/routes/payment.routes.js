const router = require('express').Router();
const controller = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');

router.post('/process', auth, controller.processPayment);

module.exports = router;
