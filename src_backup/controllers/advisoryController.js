const Advisory = require('../models/Advisory');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all advisories
// @route   GET /api/advisories
// @access  Public
exports.getAdvisories = asyncHandler(async (req, res, next) => {
  const lang = req.query.lang || 'English';
  const category = req.query.category;
  
  let query = {};
  if (category && category !== 'All') {
    query.category = category;
  }

  const advisories = await Advisory.find(query).sort('-timestamp');

  const mappedAdvisories = advisories.map((r) => {
    let title = (lang === 'Hindi') ? r.title_hi : (lang === 'Hinglish' ? r.title_hinglish : r.title_en);
    let desc = (lang === 'Hindi') ? r.desc_hi : (lang === 'Hinglish' ? r.desc_hinglish : r.desc_en);
    let detail = (lang === 'Hindi') ? r.full_detail_hi : (lang === 'Hinglish' ? r.full_detail_hinglish : r.full_detail_en);
    return { 
      id: r._id, 
      icon: r.icon, 
      category: r.category, 
      title, 
      description: desc, 
      detail, 
      timestamp: r.timestamp 
    };
  });

  res.status(200).json(mappedAdvisories);
});

// @desc    Create advisory
// @route   POST /api/advisories
// @access  Private
exports.createAdvisory = asyncHandler(async (req, res, next) => {
  const advisory = await Advisory.create(req.body);
  res.status(201).json({ success: true, id: advisory._id });
});
