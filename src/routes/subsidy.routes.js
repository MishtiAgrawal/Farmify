const router = require('express').Router();
const controller = require('../controllers/subsidy.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', controller.getSubsidies);
router.get('/:id', controller.getSubsidyById);
router.post('/apply', auth, controller.applySubsidy);

module.exports = router;
