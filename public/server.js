  const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'farmify_secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Graceful Error Handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Database initialization
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users table with comprehensive fields
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'buyer',
      phone TEXT,
      address TEXT,
      bio TEXT,
      farm_name TEXT,
      farm_type TEXT,
      experience TEXT,
      date_of_birth TEXT,
      gender TEXT,
      state TEXT,
      district TEXT,
      pincode TEXT,
      aadhar_number TEXT,
      pan_number TEXT,
      bank_account TEXT,
      ifsc_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER,
      name TEXT,
      category TEXT,
      price REAL,
      quantity INTEGER,
      image TEXT,
      FOREIGN KEY(farmer_id) REFERENCES users(id)
    )`);

    // Orders table with payment details
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      total_amount REAL,
      shipping_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(buyer_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // Existing tables (Scans, Chat, Help, Advisory, Community)
    db.run(`CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT,
      disease TEXT,
      solution TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT,
      ai_response TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS help_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS soil_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input_type TEXT,
      input_data TEXT,
      recommendation TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS advisories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icon TEXT,
      category TEXT,
      title_en TEXT, title_hi TEXT, title_hinglish TEXT,
      desc_en TEXT, desc_hi TEXT, desc_hinglish TEXT,
      full_detail_en TEXT, full_detail_hi TEXT, full_detail_hinglish TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS community_orgs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      contact TEXT,
      website TEXT,
      description TEXT
    )`);
    
    // User Farm Overview
    db.run(`CREATE TABLE IF NOT EXISTS user_farm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_area TEXT, active_crops TEXT, soil_health TEXT, yield_est TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Weather Data
    db.run(`CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      condition TEXT, temp REAL, feels_like REAL, location TEXT, pressure INTEGER, humidity INTEGER, wind REAL,
      overview TEXT, forecast JSON
    )`);

    // Soil Testing Labs
    db.run(`CREATE TABLE IF NOT EXISTS soil_labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, location TEXT, contact TEXT, services TEXT, website TEXT
    )`);

    // Machinery Rental
    db.run(`CREATE TABLE IF NOT EXISTS machinery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, type TEXT, price_per_hour REAL, owner_id INTEGER, status TEXT DEFAULT 'available', location TEXT, description TEXT,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    )`);

    // Machinery Bookings
    db.run(`CREATE TABLE IF NOT EXISTS machinery_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machinery_id INTEGER, user_id INTEGER, booking_date TEXT, hours INTEGER, status TEXT DEFAULT 'pending', timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(machinery_id) REFERENCES machinery(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Financial Ledger
    db.run(`CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, type TEXT, amount REAL, category TEXT, description TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Mandi Prices
    db.run(`CREATE TABLE IF NOT EXISTS mandi_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop TEXT,
      price REAL,
      change TEXT,
      market TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Store Items (Official Farmify Store)
    db.run(`CREATE TABLE IF NOT EXISTS store_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      unit TEXT,
      icon TEXT,
      category TEXT
    )`);

    // Subsidies - Enhanced
    db.run(`CREATE TABLE IF NOT EXISTS subsidies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT,
      benefit TEXT,
      link TEXT,
      eligibility TEXT,
      application_process TEXT,
      subsidy_amount TEXT,
      required_documents TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Subsidy Applications - Track user applications
    db.run(`CREATE TABLE IF NOT EXISTS subsidy_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subsidy_id INTEGER,
      application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'submitted',
      application_details TEXT,
      documents_uploaded TEXT,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(subsidy_id) REFERENCES subsidies(id)
    )`);

    // Soil Testing Labs - Enhanced
    db.run(`CREATE TABLE IF NOT EXISTS soil_labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      contact TEXT,
      services TEXT,
      website TEXT,
      email TEXT,
      testing_price REAL,
      turnaround_days INTEGER,
      accreditation TEXT,
      hours_of_operation TEXT,
      latitude REAL,
      longitude REAL
    )`);

    // Soil Test Bookings - Track user soil test requests
    db.run(`CREATE TABLE IF NOT EXISTS soil_test_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      lab_id INTEGER,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      test_date TEXT,
      sample_type TEXT,
      field_size REAL,
      crop_type TEXT,
      status TEXT DEFAULT 'pending',
      result_report TEXT,
      recommendations TEXT,
      cost REAL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(lab_id) REFERENCES soil_labs(id)
    )`);

    // Enhance Community Posts with Location
    db.run(`ALTER TABLE community_posts ADD COLUMN location TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // Seed initial data if needed
    db.get('SELECT COUNT(*) as count FROM advisories', (err, row) => {
      if (row && row.count === 0) {
        const advs = [
          ['🌦️', 'Weather', 'Mausam Update', 'Weather Alert', 'Monsoon is arriving early in your region.', 'आपके क्षेत्र में मानसून जल्दी आ रहा है।', 'Aapke area mein monsoon jaldi aa raha hai.', 
           'Detailed weather analysis shows a low pressure system. We recommend cleaning your drainage systems and completing sowing by Wednesday.', 'विस्तृत मौसम विश्लेषण कम दबाव प्रणाली दिखाता है।', 'Detailed analysis low pressure dikha raha hai.'],
          ['🌾', 'Crop', 'Crop Advice', 'Fasal Salah', 'Perfect time to sow wheat in North India.', 'उत्तर भारत में गेहूं बोने का सही समय।', 'North India mein gehu bone ka sahi time hai.',
           'Optimal soil temperature and moisture levels reached. Use certified seeds for 20% higher yield.', 'इष्टतम मिट्टी का तापमान।', 'Soil temp aur moisture perfect hai.'],
          ['📉', 'Market', 'Mandi Update', 'Mandi Bhav', 'Wheat prices are up by 5% today.', 'आज गेहूं के दाम 5% बढ़ गए हैं।', 'Aaj gehu ke rate 5% badh gaye hain.',
           'Market demand is high due to export orders. Consider selling partial stock now for better liquidity.', 'निर्यात आदेशों के कारण बाजार की मांग अधिक है।', 'Export orders ki wajah se demand high hai.']
        ];
        advs.forEach(a => db.run('INSERT INTO advisories (icon, category, title_en, title_hi, title_hinglish, desc_en, desc_hi, desc_hinglish, full_detail_en, full_detail_hi, full_detail_hinglish) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', a));
      }
    });

    db.get('SELECT COUNT(*) as count FROM community_orgs', (err, row) => {
      if (row && row.count === 0) {
        const orgs = [
          ['ICAR - Indian Council of Agricultural Research', 'National', '011-23388991', 'https://icar.org.in/', 'Premier research body for agriculture in India'],
          ['NABARD - National Bank for Agriculture', 'National Bank', '022-26539895', 'https://www.nabard.org/', 'Provides credit and financial services to rural sector'],
          ['Krishi Vigyan Kendra (KVK)', 'Government', '1800-123-4567', 'https://kvk.icar.gov.in/', 'District-level farm science centres for technology transfer'],
          ['Kisan Call Centre', 'Helpline', '1800-180-1551', 'https://dackkms.gov.in/', 'Free 24x7 helpline for farmers in local language'],
          ['e-NAM (National Agriculture Market)', 'Government', '1800-270-0224', 'https://enam.gov.in/', 'Online trading platform for agricultural commodities'],
          ['FCI - Food Corporation of India', 'Government', '011-23782470', 'https://fci.gov.in/', 'Procurement and distribution of food grains'],
          ['APEDA - Agri Export Authority', 'Government', '011-23374090', 'https://apeda.gov.in/', 'Promotes export of agricultural products'],
          ['India Meteorological Department', 'Government', '011-24631913', 'https://mausam.imd.gov.in/', 'Weather forecasts and alerts for farmers'],
          ['National Seed Corporation', 'Government', '011-25842803', 'https://www.indiaseeds.com/', 'Certified quality seeds for all major crops'],
          ['PM Kisan Portal', 'Government', '011-23381092', 'https://pmkisan.gov.in/', 'Income support of ₹6000/year for farmer families']
        ];
        orgs.forEach(o => db.run('INSERT INTO community_orgs (name, type, contact, website, description) VALUES (?, ?, ?, ?, ?)', o));
      }
    });

    // More Advisories
    db.get('SELECT COUNT(*) as count FROM advisories', (err, row) => {
        if (row && row.count <= 3) {
            const extraAdvs = [
                ['🍎', 'Crop', 'Apple Harvesting', 'Seb ki Katai', 'Ideal time for picking Royal Delicious apples.', 'सेब चुनने का आदर्श समय।', 'Apple picking ka sahi time hai.', 'Ensure the fruit is firm and has full color. Cool overnight before packing.', 'सुनिश्चित करें कि फल सख्त है।', 'Fruit firm hona chahiye.'],
                ['🍚', 'Crop', 'Rice Pests', 'Chawal ke Keede', 'Alert: BPH detected in some fields.', 'चेतावनी: बीपीएच का पता चला।', 'Rice mein BPH alert.', 'Monitor your paddy fields daily. If population exceeds 10 per hill, use recommended bio-pesticides.', 'धान के खेतों की निगरानी करें।', 'Fields check karte rahein.'],
                ['🌡️', 'Weather', 'Heat Wave Alert', 'Garmi ki Chetavni', 'Temperature may exceed 45°C in central India this week.', 'इस सप्ताह मध्य भारत में तापमान 45°C से अधिक हो सकता है।', 'Is week central India mein temp 45°C se zyada ho sakta hai.', 'Irrigate fields early morning or late evening. Use mulching to retain soil moisture. Avoid spraying pesticides during peak heat.', 'खेतों की सिंचाई सुबह जल्दी या शाम को देर से करें।', 'Fields ki sinchai subah ya shaam ko karein.'],
                ['💹', 'Market', 'Soybean Export Demand', 'Soybean Export', 'International demand for soybean has increased 12%.', 'सोयाबीन की अंतरराष्ट्रीय मांग 12% बढ़ी।', 'Soybean ki international demand 12% badhi.', 'US and European markets showing strong demand. Current MSP is ₹4,600/quintal. Consider holding stock for 2 more weeks for potential price rise.', 'अमेरिका और यूरोपीय बाजारों में मजबूत मांग।', 'US aur Europe markets mein strong demand hai.'],
                ['🌾', 'Crop', 'Wheat Rust Prevention', 'Gehu Rust', 'Yellow rust spotted in Punjab wheat fields.', 'पंजाब के गेहूं के खेतों में पीला रतुआ देखा गया।', 'Punjab ke gehu fields mein yellow rust dikha.', 'Apply Propiconazole 25% EC @ 0.1% spray. First spray at first appearance. Repeat after 15 days if needed. Use resistant varieties like HD-3086.', 'प्रोपिकोनाजोल 25% EC @ 0.1% स्प्रे करें।', 'Propiconazole spray karein. 15 din baad repeat karein.'],
                ['🌧️', 'Weather', 'Monsoon Forecast 2025', 'Monsoon Forecast', 'IMD predicts normal monsoon this year.', 'आईएमडी ने इस साल सामान्य मानसून की भविष्यवाणी की।', 'IMD ne is saal normal monsoon predict kiya.', 'Southwest monsoon likely to arrive in Kerala by June 1. Above normal rainfall expected in central India. Plan Kharif sowing accordingly. Recommended crops: Rice, Soybean, Cotton, Maize.', 'दक्षिण-पश्चिम मानसून 1 जून तक केरल में पहुंचने की संभावना।', 'Southwest monsoon June 1 tak Kerala pahunchega.']
            ];
            extraAdvs.forEach(a => db.run('INSERT INTO advisories (icon, category, title_en, title_hi, title_hinglish, desc_en, desc_hi, desc_hinglish, full_detail_en, full_detail_hi, full_detail_hinglish) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', a));
        }
    });

    db.get('SELECT COUNT(*) as count FROM user_farm', (err, row) => {
      if (row && row.count === 0) {
        db.run('INSERT INTO user_farm (user_id, total_area, active_crops, soil_health, yield_est) VALUES (?, ?, ?, ?, ?)', [1, '2.5 Acres', 'Wheat, Mustard', 'Good (pH 6.8)', '15 Quintals']);
      }
    });

    // Seed Soil Labs
    db.get('SELECT COUNT(*) as count FROM soil_labs', (err, row) => {
      if (row && row.count === 0) {
        const labs = [
          ['Central Soil Lab - Soil Health Card', 'New Delhi', '011-23382545', 'N,P,K Testing, pH Analysis, Organic Carbon', 'https://soilhealth.dac.gov.in/'],
          ['IISS - Indian Institute of Soil Science', 'Bhopal, MP', '0755-2730970', 'Complete Soil Analysis, Micro-nutrient Testing', 'https://iiss.icar.gov.in/'],
          ['State Soil Testing Lab MP', 'Bhopal, MP', '0755-2779484', 'NPK, pH, EC, Micronutrient Analysis', 'http://mpkrishi.mp.gov.in/'],
          ['CSSRI - Central Soil Salinity Research', 'Karnal, Haryana', '0184-2290501', 'Salinity Analysis, Reclamation Advisory', 'https://cssri.res.in/'],
          ['Regional Soil Testing Lab', 'Indore, MP', '0731-2437821', 'Basic Soil Test Kit, Fertility Mapping', 'https://soilhealth.dac.gov.in/'],
          ['Krishi Vigyan Kendra Lab', 'Ujjain, MP', '0734-2510264', 'Free Soil Testing for Farmers, Advisory', 'https://kvk.icar.gov.in/']
        ];
        labs.forEach(l => db.run('INSERT INTO soil_labs (name, location, contact, services, website) VALUES (?, ?, ?, ?, ?)', l));
      }
    });

    // Seed Subsidies with complete details
    db.get('SELECT COUNT(*) as count FROM subsidies', (err, row) => {
      if (row && row.count === 0) {
        const subs = [
          ['PM-Kisan Samman Nidhi', 'Ministry of Agriculture & Farmers Welfare', '₹6,000/year direct income support', 'https://pmkisan.gov.in/', 'All landholding farmers', 'Apply online through portal or local agriculture office', '₹6,000 per year', 'Aadhar, Land records, Bank account', 'support@pmkisan.gov.in', '1800-180-1551', new Date().toISOString()],
          ['PM Fasal Bima Yojana (PMFBY)', 'Ministry of Agriculture', 'Crop insurance at just 2% premium for Kharif', 'https://pmfby.gov.in/', 'All farmers growing covered crops', 'Register at nearest bank or through CSC', 'Insurance coverage up to ₹2 lakh', 'ID proof, Land records, Bank details', 'pmfby@ibibf.org', '1800-110-001', new Date().toISOString()],
          ['Kisan Credit Card (KCC)', 'Ministry of Finance/NABARD', 'Credit up to ₹3 lakh at 4% interest', 'https://www.nabard.org/', 'All farmers with land records', 'Apply at any bank branch', 'Up to ₹3 lakh credit', 'Identity proof, Address proof, Land records', 'info@nabard.org', '1800-180-1551', new Date().toISOString()],
          ['Soil Health Card Scheme', 'Ministry of Agriculture', 'Free soil testing and crop-wise nutrient recommendations', 'https://soilhealth.dac.gov.in/', 'All farmers', 'Contact nearest soil testing lab', 'Free soil testing', 'Land ownership proof', 'soilhealth@nic.in', '011-23382545', new Date().toISOString()],
          ['PM Krishi Sinchai Yojana', 'Ministry of Agriculture', 'Subsidy on micro-irrigation (drip/sprinkler)', 'https://pmksy.gov.in/', 'Irrigable command area farmers', 'Apply through state agricultural department', '40-50% subsidy on equipment', 'Land records, ID proof, Bank account', 'pmksy@nic.in', '1800-270-0224', new Date().toISOString()],
          ['Paramparagat Krishi Vikas Yojana', 'Ministry of Agriculture', '₹50,000/ha for organic farming clusters', 'https://pgsindia-ncof.gov.in/', 'Farmers willing to adopt organic farming', 'Form cluster of 50 farmers, apply through DARD', '₹50,000 per hectare for 3 years', 'Land records, ID proof, Aadhar', 'pgsindia@ncof.gov.in', '0755-2779000', new Date().toISOString()],
          ['e-NAM Market Subsidy', 'Ministry of Agriculture', 'Free online trading of agricultural commodities', 'https://enam.gov.in/', 'All farmers and traders', 'Register on e-NAM portal', 'Zero transaction fee for farmers', 'ID proof, Bank account', 'enam@nic.in', '1800-270-0224', new Date().toISOString()],
          ['National Mission on Sustainable Agriculture', 'Ministry of Agriculture', 'Support for climate resilient farming practices', 'https://nmsa.dac.gov.in/', 'All farmers', 'Contact state agricultural department', 'Varies by scheme', 'Land records, ID proof', 'nmsa@nic.in', '011-23388611', new Date().toISOString()],
          ['Sub-Mission on Agricultural Mechanization', 'Ministry of Agriculture', '40-50% subsidy on farm machinery purchase', 'https://agrimachinery.nic.in/', 'All farmers', 'Apply through state nodal agency', '40-50% subsidy on machinery', 'Land records, ID proof, Bank account', 'agrimachinery@nic.in', '1800-180-1551', new Date().toISOString()]
        ];
        subs.forEach(s => db.run('INSERT INTO subsidies (name, department, benefit, link, eligibility, application_process, subsidy_amount, required_documents, contact_email, contact_phone, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', s));
      }
    });

    // Seed Soil Labs with complete details
    db.get('SELECT COUNT(*) as count FROM soil_labs', (err, row) => {
      if (row && row.count === 0) {
        const labs = [
          ['Central Soil Lab - Soil Health Card', 'New Delhi', '011-23382545', 'N,P,K Testing, pH Analysis, Organic Carbon', 'https://soilhealth.dac.gov.in/', 'lab@soilhealth.nic.in', 500, 7, 'ISO 17025', 'Mon-Fri 9AM-5PM', 28.5355, 77.2292],
          ['IISS - Indian Institute of Soil Science', 'Bhopal, MP', '0755-2730970', 'Complete Soil Analysis, Micro-nutrient Testing', 'https://iiss.icar.gov.in/', 'director@iiss.res.in', 800, 10, 'ISO 17025 Accredited', 'Mon-Fri 9AM-5PM', 23.1815, 79.9864],
          ['State Soil Testing Lab MP', 'Bhopal, MP', '0755-2779484', 'NPK, pH, EC, Micronutrient Analysis', 'http://mpkrishi.mp.gov.in/', 'stlab@mpkrishi.gov.in', 400, 5, 'Government Certified', 'Mon-Fri 9AM-5PM', 23.1815, 79.9864],
          ['CSSRI - Central Soil Salinity Research', 'Karnal, Haryana', '0184-2290501', 'Salinity Analysis, Reclamation Advisory', 'https://cssri.res.in/', 'director@cssri.res.in', 600, 8, 'ISO 17025', 'Mon-Fri 9AM-5PM', 29.7244, 77.1127],
          ['Regional Soil Testing Lab', 'Indore, MP', '0731-2437821', 'Basic Soil Test Kit, Fertility Mapping', 'https://soilhealth.dac.gov.in/', 'lab@indore.gov.in', 300, 3, 'Government Certified', 'Mon-Fri 9AM-5PM', 22.7196, 75.8577],
          ['Krishi Vigyan Kendra Lab', 'Ujjain, MP', '0734-2510264', 'Free Soil Testing for Farmers, Advisory', 'https://kvk.icar.gov.in/', 'kvk@ujjain.res.in', 0, 7, 'ICAR Recognized', 'Mon-Fri 9AM-5PM', 23.1815, 75.7873]
        ];
        labs.forEach(l => db.run('INSERT INTO soil_labs (name, location, contact, services, website, email, testing_price, turnaround_days, accreditation, hours_of_operation, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', l));
      }
    });

    // Seed Machinery
    db.get('SELECT COUNT(*) as count FROM machinery', (err, row) => {
      if (row && row.count === 0) {
        db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Demo Farmer', 'demo@farmify.in', '$2a$10$dummyhash', 'farmer'], function(err) {
          const oid = this && this.lastID ? this.lastID : 1;
          const machines = [
            ['John Deere 5310 Tractor', 'Tractor', 800, oid, 'available', 'Bhopal', '55HP, suitable for all farming operations'],
            ['Mahindra Rotavator', 'Rotavator', 400, oid, 'available', 'Indore', 'Heavy duty soil preparation equipment'],
            ['Harvester Combine', 'Harvester', 1500, oid, 'available', 'Sagar', 'Multi-crop harvester for wheat, rice, soybean'],
            ['Seed Drill Machine', 'Seed Drill', 300, oid, 'available', 'Bhopal', 'Precision seed placement for better germination'],
            ['Spray Pump (Tractor)', 'Sprayer', 500, oid, 'available', 'Ujjain', 'Boom sprayer for large field pesticide application'],
            ['Mini Tractor 25HP', 'Tractor', 500, oid, 'available', 'Dewas', 'Compact tractor for small farms and horticulture']
          ];
          machines.forEach(m => db.run('INSERT INTO machinery (name, type, price_per_hour, owner_id, status, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)', m));
        });
      }
    });

    // Seed Mandi Prices
    db.get('SELECT COUNT(*) as count FROM mandi_prices', (err, row) => {
      if (row && row.count === 0) {
        const prices = [
          ['Wheat (Gehun)', 2340, '↑ +80', 'Indore'],
          ['Soybean', 4620, '↑ +180', 'Indore'],
          ['Maize (Makka)', 1890, '↓ -40', 'Bhopal'],
          ['Cotton (Kapas)', 6150, '↑ +120', 'Nagpur'],
          ['Gram (Chana)', 5210, '↓ -90', 'Indore'],
          ['Onion (Pyaaz)', 1450, '↑ +60', 'Nashik'],
          ['Tomato', 980, '↓ -120', 'Pune'],
          ['Potato (Aloo)', 1100, '↑ +30', 'Agra']
        ];
        prices.forEach(p => db.run('INSERT INTO mandi_prices (crop, price, change, market) VALUES (?, ?, ?, ?)', p));
      }
    });

    // Seed Store Items
    db.get('SELECT COUNT(*) as count FROM store_items', (err, row) => {
      if (row && row.count === 0) {
        const items = [
          ['Wheat Seeds HY', 1200, '10kg bag', '🌾', 'Seeds'],
          ['DAP Fertilizer', 1350, '50kg bag', '🧪', 'Fertilizer'],
          ['Neem Pesticide', 480, '1L bottle', '🛡️', 'Pesticide'],
          ['Drip Kit 1 Acre', 8500, 'set', '💧', 'Equipment'],
          ['Soybean Seeds', 950, '10kg bag', '🌱', 'Seeds'],
          ['Soil Test Kit', 699, 'kit', '🧪', 'Tools']
        ];
        items.forEach(i => db.run('INSERT INTO store_items (name, price, unit, icon, category) VALUES (?, ?, ?, ?, ?)', i));
      }
    });
  });
}

// Multer Setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware for token verification
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
    [name, email, hashedPassword, role || 'buyer'], function(err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/advisories', (req, res) => {
    const lang = req.query.lang || 'English';
    const category = req.query.category;
    let query = 'SELECT * FROM advisories';
    let params = [];
    if (category && category !== 'All') {
        query += ' WHERE category = ?';
        params.push(category);
    }
    query += ' ORDER BY timestamp DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const mappedRows = rows.map(r => {
            let title = (lang === 'Hindi') ? r.title_hi : (lang === 'Hinglish' ? r.title_hinglish : r.title_en);
            let desc = (lang === 'Hindi') ? r.desc_hi : (lang === 'Hinglish' ? r.desc_hinglish : r.desc_en);
            let detail = (lang === 'Hindi') ? r.full_detail_hi : (lang === 'Hinglish' ? r.full_detail_hinglish : r.full_detail_en);
            return { id: r.id, icon: r.icon, category: r.category, title, description: desc, detail, timestamp: r.timestamp };
        });
        res.json(mappedRows);
    });
});

app.post('/api/advisories', authenticate, (req, res) => {
    // Only farmers/experts can post advisories (or just check for a specific flag)
    // For demo, we allow any logged in user but usually role === 'expert'
    const { icon, category, title_en, title_hi, title_hinglish, desc_en, desc_hi, desc_hinglish, detail_en, detail_hi, detail_hinglish } = req.body;
    
    db.run(`INSERT INTO advisories (icon, category, title_en, title_hi, title_hinglish, desc_en, desc_hi, desc_hinglish, full_detail_en, full_detail_hi, full_detail_hinglish) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [icon, category, title_en, title_hi, title_hinglish, desc_en, desc_hi, desc_hinglish, detail_en, detail_hi, detail_hinglish], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true, id: this.lastID });
        });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong password' });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { name: user.name, role: user.role } });
  });
});

// authenticate middleware defined above (before routes)

// --- PRODUCT ROUTES (Farmer) ---
app.post('/api/products', authenticate, upload.single('productImage'), (req, res) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Access denied' });
  const { name, category, price, quantity } = req.body;
  const image = req.file ? req.file.path : '';
  
  db.run('INSERT INTO products (farmer_id, name, category, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, category, price, quantity, image], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/farmer/products', authenticate, (req, res) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Access denied' });
  db.all('SELECT * FROM products WHERE farmer_id = ?', [req.user.id], (err, rows) => {
    res.json(rows);
  });
});

// --- MARKETPLACE ROUTES ---
app.get('/api/marketplace', (req, res) => {
  db.all('SELECT p.*, u.name as farmer_name FROM products p JOIN users u ON p.farmer_id = u.id', (err, rows) => {
    res.json(rows);
  });
});

// --- ORDER ROUTES (Buyer) ---
app.post('/api/orders', authenticate, (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Access denied' });
  const { product_id, quantity, payment_method, shipping_address } = req.body;

  // Get product price
  db.get('SELECT price FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err || !product) return res.status(400).json({ error: 'Product not found' });

    const total_amount = product.price * quantity;

    db.run('INSERT INTO orders (buyer_id, product_id, quantity, payment_method, shipping_address, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, product_id, quantity, payment_method || 'card', shipping_address || '', total_amount], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Decrement product quantity
        db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);

        res.json({ id: this.lastID, success: true });
      });
  });
});

app.get('/api/buyer/orders', authenticate, (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Access denied' });
  db.all(`SELECT o.*, p.name as product_name, p.price, u.name as farmer_name FROM orders o 
          JOIN products p ON o.product_id = p.id 
          JOIN users u ON p.farmer_id = u.id
          WHERE o.buyer_id = ? ORDER BY o.timestamp DESC`, [req.user.id], (err, rows) => {
    res.json(rows);
  });
});

// --- FARMER ORDER MANAGEMENT ---
app.get('/api/farmer/orders', authenticate, (req, res) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Access denied' });
  db.all(`SELECT o.*, p.name as product_name, p.price, u.name as buyer_name FROM orders o 
          JOIN products p ON o.product_id = p.id 
          JOIN users u ON o.buyer_id = u.id
          WHERE p.farmer_id = ? ORDER BY o.timestamp DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error fetching orders' });
    res.json(rows);
  });
});

app.post('/api/orders/status', authenticate, (req, res) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Access denied' });
  const { order_id, status } = req.body;
  
  const validStatuses = ['shipped', 'delivered', 'pending'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.get(`SELECT o.id FROM orders o 
          JOIN products p ON o.product_id = p.id 
          WHERE o.id = ? AND p.farmer_id = ?`, [order_id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error verifying order' });
    if (!row) return res.status(403).json({ error: 'Unauthorized to update this order' });

    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, order_id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error updating status' });
      res.json({ success: true });
    });
  });
});

app.post('/api/orders/cancel', authenticate, (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Access denied' });
  const { order_id } = req.body;
  
  db.get('SELECT product_id, quantity FROM orders WHERE id = ? AND buyer_id = ? AND status = "pending"', [order_id, req.user.id], (err, order) => {
    if (err || !order) return res.status(400).json({ error: 'Order cannot be cancelled (must be pending and owned by you)' });
    
    db.run('UPDATE orders SET status = "cancelled" WHERE id = ?', [order_id], function(err) {
      if (err) return res.status(500).json({ error: 'Database error cancelling order' });
      
      // Restore product quantity
      db.run('UPDATE products SET quantity = quantity + ? WHERE id = ?', [order.quantity, order.product_id]);
      
      res.json({ success: true });
    });
  });
});

// --- PAYMENT PROCESSING ---
app.post('/api/payment/process', authenticate, (req, res) => {
  const { order_ids, payment_method, payment_details } = req.body;

  // Simulate payment processing
  setTimeout(() => {
    const transaction_id = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Update orders with payment info
    const placeholders = order_ids.map(() => '?').join(',');
    db.run(`UPDATE orders SET payment_status = 'completed', transaction_id = ?, status = 'confirmed' WHERE id IN (${placeholders})`,
      [transaction_id, ...order_ids], (err) => {
        if (err) return res.status(500).json({ error: 'Payment processing failed' });

        res.json({
          success: true,
          transaction_id,
          message: 'Payment processed successfully',
          payment_method
        });
      });
  }, 2000); // Simulate 2 second processing
});

// --- AI & DATA ROUTES ---

app.post('/api/scan', upload.single('plantImage'), (req, res) => {
  const diseases = ['Blight', 'Rust', 'Leaf Spot', 'Healthy', 'Powdery Mildew'];
  const solutions = [
    'Apply Copper fungicide and remove infected leaves.',
    'Use Sulfur-based spray and improve air circulation.',
    'Reduce overhead watering and use Neem oil spray.',
    'Your plant looks great! Keep up the good work.',
    'Apply Potassium Bicarbonate spray and prune affected areas.'
  ];
  const idx = Math.floor(Math.random() * diseases.length);
  const result = { disease: diseases[idx], solution: solutions[idx] };
  
  db.run('INSERT INTO scans (image_path, disease, solution) VALUES (?, ?, ?)', 
    [req.file ? req.file.path : 'camera', result.disease, result.solution]);
  
  res.json(result);
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  // Simple Mock AI
  let reply = "I understand you are asking about '" + message + "'. As your Krishi AI, I recommend consulting the local mandi for best prices or checking our disease predictor for plant health.";
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) reply = "Namaste! Main aapka Farmify AI assistant hoon. Main aapki kaise madad kar sakta hoon?";
  
  db.run('INSERT INTO chat_history (user_message, ai_response) VALUES (?, ?)', [message, reply]);
  res.json({ reply });
});

app.post('/api/crop-recommend', (req, res) => {
  const { soilDetails } = req.body;
  res.json({ recommendation: "Based on your description, we recommend growing Wheat or Maize for better yield." });
});

app.post('/api/crop-recommend/scan', upload.single('soilImage'), (req, res) => {
  res.json({ detected: "Loamy Soil detected", recommendation: "Perfect for Grains and Vegetables. Consider adding organic compost." });
});

app.post('/api/fertilizer-guide', (req, res) => {
  const { crop, season } = req.body;
  res.json({ guide: `For ${crop} in ${season}, use 50kg Urea and 25kg DAP per acre after first irrigation.` });
});

app.post('/api/help', (req, res) => {
  const { issue, email } = req.body;
  if (!issue) return res.status(400).json({ error: 'Please describe your issue' });
  const userEmail = email || 'anonymous@farmify.in';
  
  // Save to help_requests
  db.run('INSERT INTO help_requests (message) VALUES (?)', [`From: ${userEmail} - Query: ${issue}`]);
  
  // Also post to community feed so other farmers can help
  db.run('INSERT INTO community_posts (user_name, message, location) VALUES (?, ?, ?)', 
    ['Help Request', `🆘 ${issue} (Contact: ${userEmail})`, 'Community']);
  
  // Generate an auto-response solution
  const solutions = {
    'yellow': 'Yellowing leaves may indicate nitrogen deficiency. Apply 25kg Urea per acre. Also check for waterlogging.',
    'pest': 'For pest control, try Neem oil spray (5ml/L water) early morning. If severe, use recommended insecticide.',
    'water': 'For irrigation issues, consider drip irrigation. Apply for PM Krishi Sinchai Yojana subsidy.',
    'price': 'Check eNAM portal (enam.gov.in) for best mandi prices. Consider direct selling to FPOs.',
    'seed': 'Get certified seeds from National Seed Corporation or your nearest KVK center.',
    'soil': 'Get free soil testing from your nearest Soil Health Card center. Visit soilhealth.dac.gov.in',
    'loan': 'Apply for Kisan Credit Card at any bank branch. Interest rate is just 4% for loans up to ₹3 lakh.'
  };
  let solution = 'Our agricultural experts have been notified. You will receive detailed guidance shortly. Meanwhile, contact Kisan Helpline: 1800-180-1551 (free, 24x7).';
  const issueLower = issue.toLowerCase();
  for (const [key, val] of Object.entries(solutions)) {
    if (issueLower.includes(key)) { solution = val; break; }
  }
  
  console.log(`[HELP] Solution email to ${userEmail}: ${solution}`);
  res.json({ 
    message: `Query sent to community & experts! Solution sent to ${userEmail}.`,
    solution: solution,
    email_sent: true
  });
});

app.get('/api/community/posts', (req, res) => {
  db.all('SELECT * FROM community_posts ORDER BY timestamp DESC LIMIT 20', (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/community/posts', authenticate, (req, res) => {
  const { message, location } = req.body;
  db.run('INSERT INTO community_posts (user_name, message, location) VALUES (?, ?, ?)', [req.user.name, message, location || 'Unknown'], () => {
    res.json({ success: true });
  });
});

app.get('/api/community/orgs', (req, res) => {
  db.all('SELECT * FROM community_orgs', (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/farm-overview', authenticate, (req, res) => {
    db.get('SELECT * FROM user_farm WHERE user_id = ? LIMIT 1', [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row || { total_area: 'N/A', active_crops: 'None', soil_health: 'Pending', yield_est: '0' });
    });
});

app.post('/api/farm-overview', authenticate, (req, res) => {
    const { total_area, active_crops, soil_health, yield_est } = req.body;
    db.get('SELECT id FROM user_farm WHERE user_id = ?', [req.user.id], (err, row) => {
        if (row) {
            db.run('UPDATE user_farm SET total_area = ?, active_crops = ?, soil_health = ?, yield_est = ? WHERE user_id = ?',
                [total_area, active_crops, soil_health, yield_est, req.user.id], (err) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    res.json({ success: true });
                });
        } else {
            db.run('INSERT INTO user_farm (user_id, total_area, active_crops, soil_health, yield_est) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, total_area, active_crops, soil_health, yield_est], (err) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    res.json({ success: true });
                });
        }
    });
});

// --- NEW ENDPOINTS ---

app.get('/api/profile', authenticate, (req, res) => {
    db.get('SELECT id, name, email, role, phone, address, bio, farm_name, farm_type, experience, date_of_birth, gender, state, district, pincode, aadhar_number, pan_number, bank_account, ifsc_code, created_at FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row);
    });
});

app.post('/api/profile', authenticate, (req, res) => {
    const { name, email, phone, address, bio, farm_name, farm_type, experience, date_of_birth, gender, state, district, pincode, aadhar_number, pan_number, bank_account, ifsc_code } = req.body;
    db.run(`UPDATE users SET name = ?, email = ?, phone = ?, address = ?, bio = ?, farm_name = ?, farm_type = ?, experience = ?, date_of_birth = ?, gender = ?, state = ?, district = ?, pincode = ?, aadhar_number = ?, pan_number = ?, bank_account = ?, ifsc_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, email, phone, address, bio, farm_name, farm_type, experience, date_of_birth, gender, state, district, pincode, aadhar_number, pan_number, bank_account, ifsc_code, req.user.id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error updating profile' });
            res.json({ success: true });
        });
});

app.get('/api/weather', (req, res) => {
    const hour = new Date().getHours();
    const baseTemp = 28 + Math.sin(hour * Math.PI / 12) * 8;
    const weather = {
        condition: hour < 6 ? 'Clear Night' : hour < 10 ? 'Morning Haze' : hour < 16 ? 'Partly Cloudy' : hour < 19 ? 'Warm Evening' : 'Clear Night',
        temp: Math.round(baseTemp * 10) / 10,
        feels_like: Math.round((baseTemp + 2.5) * 10) / 10,
        location: 'Bhopal, India',
        pressure: 1012 + Math.floor(Math.random() * 6),
        humidity: 55 + Math.floor(Math.random() * 20),
        wind_speed: Math.round((8 + Math.random() * 10) * 10) / 10,
        wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        wind_gust: Math.round((12 + Math.random() * 15) * 10) / 10,
        uv_index: hour > 6 && hour < 18 ? Math.min(11, Math.round(Math.sin((hour - 6) * Math.PI / 12) * 11)) : 0,
        dew_point: Math.round((baseTemp - 8) * 10) / 10,
        visibility: 8 + Math.floor(Math.random() * 5),
        sunrise: '05:42 AM',
        sunset: '06:58 PM',
        overview: 'Good farming conditions. Soil moisture adequate for current crops. No extreme weather alerts. Suitable for field work and spraying operations.',
        crop_advisory: 'Wheat: Monitor for yellow rust. Soybean: Good sowing window. Cotton: Ensure adequate irrigation. Vegetables: Apply mulch to retain moisture.',
        forecast: [
            { day: 'Mon', temp_high: 34, temp_low: 22, cond: 'Sunny', humidity: 55, wind: 10, rain_chance: 5 },
            { day: 'Tue', temp_high: 33, temp_low: 21, cond: 'Partly Cloudy', humidity: 60, wind: 12, rain_chance: 15 },
            { day: 'Wed', temp_high: 31, temp_low: 23, cond: 'Cloudy', humidity: 70, wind: 15, rain_chance: 40 },
            { day: 'Thu', temp_high: 29, temp_low: 22, cond: 'Light Rain', humidity: 80, wind: 18, rain_chance: 75 },
            { day: 'Fri', temp_high: 30, temp_low: 21, cond: 'Sunny', humidity: 58, wind: 8, rain_chance: 10 },
            { day: 'Sat', temp_high: 32, temp_low: 20, cond: 'Clear', humidity: 52, wind: 7, rain_chance: 5 },
            { day: 'Sun', temp_high: 35, temp_low: 23, cond: 'Hot & Sunny', humidity: 45, wind: 9, rain_chance: 0 }
        ]
    };
    res.json(weather);
});

app.get('/api/soil-labs', (req, res) => {
    db.all('SELECT * FROM soil_labs ORDER BY name ASC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/soil-labs/book', authenticate, (req, res) => {
    const { lab_id, test_date, sample_type, field_size, crop_type } = req.body;

    // Get lab details to set cost
    db.get('SELECT testing_price FROM soil_labs WHERE id = ?', [lab_id], (err, lab) => {
        if (err || !lab) return res.status(400).json({ error: 'Lab not found' });

        db.run('INSERT INTO soil_test_bookings (user_id, lab_id, test_date, sample_type, field_size, crop_type, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, lab_id, test_date, sample_type, field_size, crop_type, lab.testing_price], function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ id: this.lastID, success: true, message: 'Soil test booking confirmed', cost: lab.testing_price });
            });
    });
});

app.get('/api/soil-labs/bookings', authenticate, (req, res) => {
    db.all(`SELECT stb.*, sl.name, sl.location, sl.email, sl.contact FROM soil_test_bookings stb 
            JOIN soil_labs sl ON stb.lab_id = sl.id 
            WHERE stb.user_id = ? ORDER BY stb.booking_date DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows || []);
    });
});

app.get('/api/subsidies', (req, res) => {
    db.all('SELECT * FROM subsidies ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/subsidies/apply', authenticate, (req, res) => {
    const { subsidy_id, application_details, documents } = req.body;

    db.run('INSERT INTO subsidy_applications (user_id, subsidy_id, application_details, documents_uploaded) VALUES (?, ?, ?, ?)',
        [req.user.id, subsidy_id, application_details, documents], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, success: true, message: 'Application submitted successfully' });
        });
});

app.get('/api/subsidies/applications', authenticate, (req, res) => {
    db.all(`SELECT sa.*, s.name, s.benefit, s.link FROM subsidy_applications sa 
            JOIN subsidies s ON sa.subsidy_id = s.id 
            WHERE sa.user_id = ? ORDER BY sa.application_date DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows || []);
    });
});

app.get('/api/mandi', (req, res) => {
    db.all('SELECT * FROM mandi_prices ORDER BY crop ASC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/store', (req, res) => {
    db.all('SELECT * FROM store_items', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/ledger', authenticate, (req, res) => {
    db.all('SELECT * FROM ledger WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id], (err, rows) => {
        res.json(rows);
    });
});

app.post('/api/ledger', authenticate, (req, res) => {
    const { type, amount, category, description } = req.body;
    db.run('INSERT INTO ledger (user_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, type, amount, category, description], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        });
});

app.get('/api/machinery', (req, res) => {
    db.all('SELECT m.*, u.name as owner_name FROM machinery m LEFT JOIN users u ON m.owner_id = u.id', (err, rows) => {
        res.json(rows || []);
    });
});

app.post('/api/machinery', authenticate, (req, res) => {
    const { name, type, price_per_hour, location, description } = req.body;
    db.run('INSERT INTO machinery (name, type, price_per_hour, owner_id, location, description) VALUES (?, ?, ?, ?, ?, ?)',
        [name, type, price_per_hour, req.user.id, location || '', description || ''], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true, id: this.lastID });
        });
});

app.post('/api/machinery/book', authenticate, (req, res) => {
    const { machinery_id, booking_date, hours } = req.body;
    db.run('INSERT INTO machinery_bookings (machinery_id, user_id, booking_date, hours) VALUES (?, ?, ?, ?)',
        [machinery_id, req.user.id, booking_date, hours], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            db.run('UPDATE machinery SET status = ? WHERE id = ?', ['booked', machinery_id]);
            res.json({ success: true, booking_id: this.lastID, message: 'Machinery booked! Owner will contact you shortly.' });
        });
});

app.get('/api/machinery/bookings', authenticate, (req, res) => {
    db.all(`SELECT mb.*, m.name as machine_name, m.type, m.price_per_hour, u.name as owner_name 
            FROM machinery_bookings mb JOIN machinery m ON mb.machinery_id = m.id 
            LEFT JOIN users u ON m.owner_id = u.id WHERE mb.user_id = ? ORDER BY mb.timestamp DESC`, 
        [req.user.id], (err, rows) => {
            res.json(rows || []);
        });
});

// Start server
const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Final error middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
