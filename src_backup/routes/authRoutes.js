const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/profile', protect, getMe);
router.post('/profile', protect, updateProfile);

module.exports = router;
