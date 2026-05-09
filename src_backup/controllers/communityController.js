const { CommunityPost, CommunityOrg } = require('../models/Community');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await CommunityPost.find().sort('-timestamp').limit(20);
  res.status(200).json(posts);
});

// @desc    Create community post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  const { message, location } = req.body;
  await CommunityPost.create({
    user_name: req.user.name,
    message,
    location: location || 'Unknown',
  });
  res.status(201).json({ success: true });
});

// @desc    Get community organizations
// @route   GET /api/community/orgs
// @access  Public
exports.getOrgs = asyncHandler(async (req, res, next) => {
  const orgs = await CommunityOrg.find();
  res.status(200).json(orgs);
});
