const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');

router.get('/stats', auth, controller.getStats);
router.get('/farm-overview', auth, controller.getFarmOverview);
router.post('/farm-overview', auth, controller.updateFarmOverview);
router.get('/weather', controller.getWeather);
router.get('/mandi', controller.getMandi);
router.get('/store', controller.getStore);

module.exports = router;
