const express = require('express');
const { getAdvisories, createAdvisory } = require('../controllers/advisoryController');
const { getPosts, createPost, getOrgs } = require('../controllers/communityController');
const { getFarmOverview, updateFarmOverview, getMachinery, createMachinery, bookMachinery, getMachineryBookings, getLedger, createLedgerEntry } = require('../controllers/farmController');
const { getWeather, getMandiPrices, getStoreItems, getSoilLabs, bookSoilTest, getSoilTestBookings, getSubsidies, applyForSubsidy, getSubsidyApplications } = require('../controllers/externalController');
const { scanPlant, chatAI, recommendCrop, scanSoil, fertilizerGuide, submitHelp } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Advisory
router.get('/advisories', getAdvisories);
router.post('/advisories', protect, createAdvisory);

// Community
router.get('/community/posts', getPosts);
router.post('/community/posts', protect, createPost);
router.get('/community/orgs', getOrgs);

// Farm Overview
router.get('/farm-overview', protect, getFarmOverview);
router.post('/farm-overview', protect, updateFarmOverview);

// Machinery
router.get('/machinery', getMachinery);
router.post('/machinery', protect, createMachinery);
router.post('/machinery/book', protect, bookMachinery);
router.get('/machinery/bookings', protect, getMachineryBookings);

// Ledger
router.get('/ledger', protect, getLedger);
router.post('/ledger', protect, createLedgerEntry);

// External Data
router.get('/weather', getWeather);
router.get('/mandi', getMandiPrices);
router.get('/store', getStoreItems);
router.get('/soil-labs', getSoilLabs);
router.post('/soil-labs/book', protect, bookSoilTest);
router.get('/soil-labs/bookings', protect, getSoilTestBookings);
router.get('/subsidies', getSubsidies);
router.post('/subsidies/apply', protect, applyForSubsidy);
router.get('/subsidies/applications', protect, getSubsidyApplications);

// AI & Tools
router.post('/scan', upload.single('plantImage'), scanPlant);
router.post('/chat', chatAI);
router.post('/crop-recommend', recommendCrop);
router.post('/crop-recommend/scan', upload.single('soilImage'), scanSoil);
router.post('/fertilizer-guide', fertilizerGuide);
router.post('/help', submitHelp);

module.exports = router;
