const router = require('express').Router();
const controller = require('../controllers/machinery.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', controller.getMachinery);
router.post('/book', auth, controller.bookMachinery);

module.exports = router;
