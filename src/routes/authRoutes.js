const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { registerValidation, loginValidation, updateProfileValidation } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/signup', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/profile', protect, getMe);
router.post('/profile', protect, updateProfileValidation, validateRequest, updateProfile);

module.exports = router;
