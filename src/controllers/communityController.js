const { CommunityPost, CommunityOrg } = require('../models/Community');
const asyncHandler = require('../utils/asyncHandler');

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await CommunityPost.find().sort('-timestamp').limit(20);
  res.status(200).json({ success: true, data: posts });
});

exports.createPost = asyncHandler(async (req, res) => {
  const { message, location } = req.body;
  const post = await CommunityPost.create({
    user_name: req.user.name,
    message,
    location: location || 'Unknown',
  });

  res.status(201).json({ success: true, data: post });
});

exports.getOrgs = asyncHandler(async (req, res) => {
  const orgs = await CommunityOrg.find();
  res.status(200).json({ success: true, data: orgs });
});
