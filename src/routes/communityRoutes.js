const express = require('express');
const { getPosts, createPost, getOrgs } = require('../controllers/communityController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createCommunityPostValidation } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/community/posts', getPosts);
router.post('/community/posts', protect, createCommunityPostValidation, validateRequest, createPost);
router.get('/community/orgs', getOrgs);

module.exports = router;
