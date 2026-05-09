const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  updateFarmOverviewValidation,
  createMachineryValidation,
  bookMachineryValidation,
  createLedgerEntryValidation,
} = require('../utils/validationSchemas');
const {
  getFarmOverview,
  updateFarmOverview,
  getMachinery,
  createMachinery,
  bookMachinery,
  getMachineryBookings,
  getLedger,
  createLedgerEntry,
} = require('../controllers/farmController');

const router = express.Router();

router.get('/farm-overview', protect, getFarmOverview);
router.post('/farm-overview', protect, updateFarmOverviewValidation, validateRequest, updateFarmOverview);

router.get('/machinery', getMachinery);
router.post('/machinery', protect, authorize('farmer'), createMachineryValidation, validateRequest, createMachinery);
router.post('/machinery/book', protect, bookMachineryValidation, validateRequest, bookMachinery);
router.get('/machinery/bookings', protect, getMachineryBookings);

router.get('/ledger', protect, getLedger);
router.post('/ledger', protect, createLedgerEntryValidation, validateRequest, createLedgerEntry);

module.exports = router;
