const router = require('express').Router();
const controller = require('../controllers/soil.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/soil-labs', controller.getSoilLabs);
router.post('/soil-labs/book', auth, controller.bookSoilTest);
router.post('/crop-recommend', auth, controller.cropRecommend);
router.post('/crop-recommend/scan', auth, upload.single('soilImage'), controller.cropRecommendScan);
router.post('/fertilizer-guide', auth, controller.fertilizerGuide);

module.exports = router;
