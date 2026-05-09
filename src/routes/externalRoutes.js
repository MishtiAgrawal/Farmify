const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  bookSoilTestValidation,
  applyForSubsidyValidation,
} = require('../utils/validationSchemas');
const {
  getWeather,
  getMandiPrices,
  getStoreItems,
  getSoilLabs,
  bookSoilTest,
  getSoilTestBookings,
  getSubsidies,
  applyForSubsidy,
  getSubsidyApplications,
} = require('../controllers/externalController');

const router = express.Router();

router.get('/weather', getWeather);
router.get('/mandi', getMandiPrices);
router.get('/store', getStoreItems);
router.get('/soil-labs', getSoilLabs);
router.post('/soil-labs/book', protect, bookSoilTestValidation, validateRequest, bookSoilTest);
router.get('/soil-labs/bookings', protect, getSoilTestBookings);
router.get('/subsidies', getSubsidies);
router.post('/subsidies/apply', protect, applyForSubsidyValidation, validateRequest, applyForSubsidy);
router.get('/subsidies/applications', protect, getSubsidyApplications);

module.exports = router;
