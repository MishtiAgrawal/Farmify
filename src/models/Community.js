const mongoose = require('mongoose');

// Community Post Schema
const CommunityPostSchema = new mongoose.Schema({
  user_name: String,
  message: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
});

// Community Org Schema
const CommunityOrgSchema = new mongoose.Schema({
  name: String,
  type: String,
  contact: String,
  website: String,
  description: String,
});

const CommunityPost = mongoose.model('CommunityPost', CommunityPostSchema);
const CommunityOrg = mongoose.model('CommunityOrg', CommunityOrgSchema);

module.exports = { CommunityPost, CommunityOrg };
