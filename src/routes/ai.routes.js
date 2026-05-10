const router = require('express').Router();
const controller = require('../controllers/ai.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/chat', controller.chat);
router.get('/chat/history', auth, controller.getChatHistory);
router.post('/scan', upload.single('plantImage'), controller.scanPlant);
router.post('/help', auth, controller.help);

// Community
router.get('/community/posts', controller.getCommunityPosts);
router.post('/community/posts', auth, controller.createCommunityPost);
router.post('/community/posts/:id/like', auth, controller.likeCommunityPost);
router.get('/community/orgs', controller.getCommunityOrgs);

// Advisory
router.get('/advisories', controller.getAdvisories);
router.post('/advisories', auth, controller.createAdvisory);

module.exports = router;
