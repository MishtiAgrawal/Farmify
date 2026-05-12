const express = require('express');
const router = express.Router();

const auth = require('../controllers/auth.controller');
const marketplace = require('../controllers/marketplace.controller');
const orders = require('../controllers/orders.controller');
const dashboard = require('../controllers/dashboard.controller');
const ledger = require('../controllers/ledger.controller');
const ai = require('../controllers/ai.controller');
const subsidy = require('../controllers/subsidy.controller');
const machinery = require('../controllers/machinery.controller');
const soil = require('../controllers/soil.controller');
const payment = require('../controllers/payment.controller');

const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * ROUTES MAPPED TO MATCH FRONTEND FETCH CALLS EXACTLY
 */

// --- AUTH ---
router.post('/auth/signup', authLimiter, auth.signup);
router.post('/auth/login', authLimiter, auth.login);
router.post('/auth/logout', authenticateToken, auth.logout);
router.get('/auth/me', authenticateToken, auth.me);
router.post('/auth/change-password', authenticateToken, auth.changePassword);

// --- PROFILE ---
router.get('/profile', authenticateToken, auth.getProfile);
router.put('/profile', authenticateToken, auth.updateProfile);

// --- DASHBOARD & OVERVIEW ---
router.get('/farm-overview', authenticateToken, dashboard.getFarmOverview);
router.put('/farm-overview', authenticateToken, dashboard.updateFarmOverview);
router.get('/dashboard/stats', authenticateToken, dashboard.getStats);
router.get('/weather', dashboard.getWeather);
router.get('/mandi', dashboard.getMandi);
router.get('/store', dashboard.getStore);

// --- MARKETPLACE & PRODUCTS ---
router.get('/marketplace', marketplace.getMarketplace);
router.post('/products', authenticateToken, requireRole('farmer', 'expert'), upload.single('productImage'), marketplace.createProduct);
router.get('/farmer/products', authenticateToken, requireRole('farmer', 'expert'), marketplace.getFarmerProducts);
router.put('/products/:id', authenticateToken, requireRole('farmer', 'expert'), marketplace.updateProduct);
router.delete('/products/:id', authenticateToken, requireRole('farmer', 'expert'), marketplace.deleteProduct);

// --- CART ---
router.get('/cart', authenticateToken, marketplace.getCart);
router.post('/cart', authenticateToken, marketplace.addToCart);
router.put('/cart/:id', authenticateToken, marketplace.updateCartItem);
router.delete('/cart/:id', authenticateToken, marketplace.deleteCartItem);
router.delete('/cart', authenticateToken, marketplace.clearCart);

// --- ORDERS ---
router.post('/orders', authenticateToken, orders.createOrder);
router.get('/buyer/orders', authenticateToken, orders.getBuyerOrders);
router.get('/farmer/orders', authenticateToken, requireRole('farmer', 'expert'), orders.getFarmerOrders);
router.put('/orders/status', authenticateToken, requireRole('farmer', 'expert'), orders.updateOrderStatus);
router.post('/orders/cancel', authenticateToken, orders.cancelOrder);

// --- PAYMENTS ---
router.post('/payment/process', authenticateToken, payment.processPayment);

// --- LEDGER ---
router.get('/ledger', authenticateToken, ledger.getLedger);
router.post('/ledger', authenticateToken, ledger.createLedgerEntry);
router.delete('/ledger/:id', authenticateToken, ledger.deleteLedgerEntry);

// --- AI & COMMUNITY ---
router.get('/advisories', ai.getAdvisories);
router.post('/advisories', authenticateToken, requireRole('expert'), ai.createAdvisory);
router.get('/community/posts', ai.getCommunityPosts);
router.post('/community/posts', authenticateToken, ai.createCommunityPost);
router.post('/community/posts/:id/like', authenticateToken, ai.likeCommunityPost);
router.get('/community/orgs', ai.getCommunityOrgs);
router.post('/chat', ai.chat); // Note: frontend doesn't use auth for chat yet
router.get('/ai/chat/history', authenticateToken, ai.getChatHistory);
router.post('/scan', upload.single('plantImage'), ai.scanPlant);
router.post('/help', authenticateToken, ai.help);

// --- SOIL ---
router.get('/soil-labs', soil.getSoilLabs);
router.post('/soil-labs/book', authenticateToken, soil.bookSoilTest);
router.post('/crop-recommend', soil.cropRecommend);
router.post('/crop-recommend/scan', soil.cropRecommendScan);
router.post('/fertilizer-guide', soil.fertilizerGuide);

// --- SUBSIDY ---
router.get('/subsidies', subsidy.getSubsidies);
router.post('/subsidies/apply', authenticateToken, subsidy.applySubsidy);

// --- MACHINERY ---
router.get('/machinery', machinery.getMachinery);
router.post('/machinery/book', authenticateToken, machinery.bookMachinery);

// --- HEALTH CHECK ---
router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

module.exports = router;
