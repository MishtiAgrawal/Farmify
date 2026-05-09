const Advisory = require('../models/Advisory');
const asyncHandler = require('../utils/asyncHandler');

exports.getAdvisories = asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'English';
  const category = req.query.category;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  const advisories = await Advisory.find(query).sort('-timestamp');
  const mappedAdvisories = advisories.map((advisory) => {
    const title = lang === 'Hindi' ? advisory.title_hi : lang === 'Hinglish' ? advisory.title_hinglish : advisory.title_en;
    const description = lang === 'Hindi' ? advisory.desc_hi : lang === 'Hinglish' ? advisory.desc_hinglish : advisory.desc_en;
    const detail = lang === 'Hindi' ? advisory.full_detail_hi : lang === 'Hinglish' ? advisory.full_detail_hinglish : advisory.full_detail_en;

    return {
      id: advisory._id,
      icon: advisory.icon,
      category: advisory.category,
      title,
      description,
      detail,
      timestamp: advisory.timestamp,
    };
  });

  res.status(200).json({ success: true, data: mappedAdvisories });
});

exports.createAdvisory = asyncHandler(async (req, res) => {
  const advisory = await Advisory.create(req.body);
  res.status(201).json({ success: true, data: advisory });
});
