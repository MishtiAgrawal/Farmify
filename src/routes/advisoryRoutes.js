const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createAdvisoryValidation } = require('../utils/validationSchemas');
const { getAdvisories, createAdvisory } = require('../controllers/advisoryController');

const router = express.Router();

router.get('/advisories', getAdvisories);
router.post('/advisories', protect, createAdvisoryValidation, validateRequest, createAdvisory);

module.exports = router;
