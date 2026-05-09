require('dotenv').config();
const mongoose = require('mongoose');
const Advisory = require('../models/Advisory');
const { CommunityOrg } = require('../models/Community');
const { MandiPrice, StoreItem, SoilLab, Subsidy } = require('../models/External');
const { Machinery } = require('../models/Farm');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Advisory.deleteMany();
    await CommunityOrg.deleteMany();
    await MandiPrice.deleteMany();
    await StoreItem.deleteMany();
    await SoilLab.deleteMany();
    await Subsidy.deleteMany();
    await Machinery.deleteMany();

    // Seeding logic here (simplified versions of the original data)
    await Advisory.create([
      { icon: '🚨', category: 'Live', title_en: 'Pest Outbreak Alert', desc_en: 'Reported in Northern District.', full_detail_en: 'Immediate action required...' },
      { icon: '🌦️', category: 'Weather', title_en: 'Monsoon Alert', desc_en: 'Monsoon is arriving early.', full_detail_en: 'Detailed analysis...' },
      { icon: '🌾', category: 'Crop', title_en: 'Wheat Advice', desc_en: 'Perfect time for wheat.', full_detail_en: 'Optimal soil temp...' },
    ]);

    await CommunityOrg.create([
      { name: 'ICAR', type: 'National', contact: '011-23388991', website: 'https://icar.org.in/', description: 'Premier research body' },
      { name: 'NABARD', type: 'Bank', contact: '022-26539895', website: 'https://nabard.org/', description: 'Rural financial services' },
    ]);

    // Add more seeding as needed...

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
