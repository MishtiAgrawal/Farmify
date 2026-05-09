const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const upload = require('../middlewares/uploadMiddleware');
const {
  chatValidation,
  fertilizerGuideValidation,
  submitHelpValidation,
} = require('../utils/validationSchemas');
const {
  scanPlant,
  chatAI,
  recommendCrop,
  scanSoil,
  fertilizerGuide,
  submitHelp,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/scan', upload.single('plantImage'), scanPlant);
router.post('/chat', chatValidation, validateRequest, chatAI);
router.post('/crop-recommend', recommendCrop);
router.post('/crop-recommend/scan', upload.single('soilImage'), scanSoil);
router.post('/fertilizer-guide', fertilizerGuideValidation, validateRequest, fertilizerGuide);
router.post('/help', submitHelpValidation, validateRequest, submitHelp);

module.exports = router;
