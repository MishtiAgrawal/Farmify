const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/logout', auth, controller.logout);
router.get('/me', auth, controller.me);
router.post('/change-password', auth, controller.changePassword);

module.exports = router;
