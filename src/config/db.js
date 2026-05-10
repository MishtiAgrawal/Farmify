const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ DB connect error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
  db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA foreign_keys = ON;");
    initSchema();
  });
});

async function initSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      name       TEXT NOT NULL, 
      email      TEXT UNIQUE NOT NULL, 
      password   TEXT NOT NULL, 
      role       TEXT DEFAULT 'farmer' CHECK(role IN ('farmer','buyer','expert')), 
      phone      TEXT, 
      location   TEXT, 
      avatar     TEXT, 
      bio        TEXT, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS profiles ( 
      user_id         INTEGER PRIMARY KEY REFERENCES users(id), 
      farm_name       TEXT, 
      farm_size       REAL, 
      farm_location   TEXT, 
      soil_type       TEXT, 
      bank_account    TEXT, 
      ifsc_code       TEXT, 
      upi_id          TEXT, 
      kisan_card      TEXT, 
      aadhar          TEXT, 
      pan             TEXT, 
      updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS products ( 
      id          INTEGER PRIMARY KEY AUTOINCREMENT, 
      farmer_id   INTEGER REFERENCES users(id), 
      name        TEXT NOT NULL, 
      category    TEXT, 
      description TEXT, 
      price       REAL NOT NULL, 
      unit        TEXT DEFAULT 'kg', 
      quantity    REAL DEFAULT 0, 
      image_url   TEXT, 
      is_active   INTEGER DEFAULT 1, 
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS cart ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      buyer_id   INTEGER REFERENCES users(id), 
      product_id INTEGER REFERENCES products(id), 
      quantity   REAL DEFAULT 1, 
      added_at   DATETIME DEFAULT CURRENT_TIMESTAMP, 
      UNIQUE(buyer_id, product_id) 
    )`,
    `CREATE TABLE IF NOT EXISTS orders ( 
      id             INTEGER PRIMARY KEY AUTOINCREMENT, 
      buyer_id       INTEGER REFERENCES users(id), 
      farmer_id      INTEGER REFERENCES users(id), 
      product_id     INTEGER REFERENCES products(id), 
      quantity       REAL NOT NULL, 
      price_per_unit REAL NOT NULL, 
      total          REAL NOT NULL, 
      status         TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')), 
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','paid','refunded')), 
      payment_id     TEXT, 
      delivery_addr  TEXT, 
      notes          TEXT, 
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP, 
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS payments ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      order_id   INTEGER REFERENCES orders(id), 
      user_id    INTEGER REFERENCES users(id), 
      amount     REAL NOT NULL, 
      method     TEXT, 
      status     TEXT DEFAULT 'pending', 
      txn_ref    TEXT UNIQUE, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS soil_labs ( 
      id           INTEGER PRIMARY KEY AUTOINCREMENT, 
      name         TEXT NOT NULL, 
      location     TEXT, 
      address      TEXT, 
      phone        TEXT, 
      email        TEXT, 
      rating       REAL DEFAULT 4.0, 
      certified    INTEGER DEFAULT 1, 
      services     TEXT, 
      price_range  TEXT, 
      working_days TEXT, 
      image_url    TEXT 
    )`,
    `CREATE TABLE IF NOT EXISTS soil_bookings ( 
      id          INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id     INTEGER REFERENCES users(id), 
      lab_id      INTEGER REFERENCES soil_labs(id), 
      test_date   TEXT NOT NULL, 
      sample_type TEXT, 
      field_size  REAL, 
      crop_type   TEXT, 
      notes       TEXT, 
      status      TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')), 
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS subsidies ( 
      id              INTEGER PRIMARY KEY AUTOINCREMENT, 
      name            TEXT NOT NULL, 
      ministry        TEXT, 
      description     TEXT, 
      eligibility     TEXT, 
      benefits        TEXT, 
      documents       TEXT, 
      application_url TEXT, 
      deadline        TEXT, 
      max_amount      REAL, 
      category        TEXT, 
      state           TEXT DEFAULT 'All', 
      is_active       INTEGER DEFAULT 1 
    )`,
    `CREATE TABLE IF NOT EXISTS subsidy_applications ( 
      id             INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id        INTEGER REFERENCES users(id), 
      subsidy_id     INTEGER REFERENCES subsidies(id), 
      full_name      TEXT NOT NULL, 
      aadhar         TEXT, 
      land_area      REAL, 
      crop_type      TEXT, 
      bank_account   TEXT, 
      status         TEXT DEFAULT 'submitted' CHECK(status IN ('submitted','under_review','approved','rejected')), 
      remarks        TEXT, 
      submitted_at   DATETIME DEFAULT CURRENT_TIMESTAMP, 
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS advisories ( 
      id          INTEGER PRIMARY KEY AUTOINCREMENT, 
      author_id   INTEGER REFERENCES users(id), 
      title       TEXT NOT NULL, 
      content     TEXT NOT NULL, 
      category    TEXT CHECK(category IN ('crop','market','weather','pest','soil','general')), 
      language    TEXT DEFAULT 'en', 
      tags        TEXT, 
      source_url  TEXT, 
      is_pinned   INTEGER DEFAULT 0, 
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS community_posts ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      author_id  INTEGER REFERENCES users(id), 
      title      TEXT NOT NULL, 
      content    TEXT, 
      category   TEXT, 
      likes      INTEGER DEFAULT 0, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS community_orgs ( 
      id          INTEGER PRIMARY KEY AUTOINCREMENT, 
      name        TEXT NOT NULL, 
      description TEXT, 
      location    TEXT, 
      contact     TEXT, 
      website     TEXT, 
      category    TEXT, 
      members     INTEGER DEFAULT 0 
    )`,
    `CREATE TABLE IF NOT EXISTS help_requests ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id    INTEGER REFERENCES users(id), 
      subject    TEXT NOT NULL, 
      message    TEXT NOT NULL, 
      category   TEXT, 
      priority   TEXT DEFAULT 'normal', 
      status     TEXT DEFAULT 'open', 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS machinery ( 
      id           INTEGER PRIMARY KEY AUTOINCREMENT, 
      name         TEXT NOT NULL, 
      type         TEXT, 
      description  TEXT, 
      price_per_day REAL NOT NULL, 
      location     TEXT, 
      owner_id     INTEGER REFERENCES users(id), 
      image_url    TEXT, 
      is_available INTEGER DEFAULT 1, 
      rating       REAL DEFAULT 4.0 
    )`,
    `CREATE TABLE IF NOT EXISTS machinery_bookings ( 
      id           INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id      INTEGER REFERENCES users(id), 
      machinery_id INTEGER REFERENCES machinery(id), 
      start_date   TEXT NOT NULL, 
      end_date     TEXT NOT NULL, 
      total_days   INTEGER, 
      total_cost   REAL, 
      notes        TEXT, 
      status       TEXT DEFAULT 'pending', 
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS farm_overview ( 
      id              INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id         INTEGER UNIQUE REFERENCES users(id), 
      total_land      REAL DEFAULT 0, 
      active_crops    TEXT, 
      soil_health     INTEGER DEFAULT 75, 
      yield_estimate  REAL DEFAULT 0, 
      water_usage     REAL DEFAULT 0, 
      last_harvest    TEXT, 
      next_sowing     TEXT, 
      notes           TEXT, 
      updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS ledger ( 
      id          INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id     INTEGER REFERENCES users(id), 
      type        TEXT CHECK(type IN ('income','expense')), 
      category    TEXT, 
      amount      REAL NOT NULL, 
      description TEXT, 
      date        TEXT NOT NULL, 
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS store_items ( 
      id           INTEGER PRIMARY KEY AUTOINCREMENT, 
      name         TEXT NOT NULL, 
      category     TEXT, 
      description  TEXT, 
      price        REAL NOT NULL, 
      unit         TEXT, 
      brand        TEXT, 
      image_url    TEXT, 
      is_available INTEGER DEFAULT 1 
    )`,
    `CREATE TABLE IF NOT EXISTS chat_history ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id    INTEGER REFERENCES users(id), 
      role       TEXT CHECK(role IN ('user','assistant')), 
      message    TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
    `CREATE TABLE IF NOT EXISTS blacklisted_tokens ( 
      id         INTEGER PRIMARY KEY AUTOINCREMENT, 
      token      TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`,
  ];

  for (const sql of tables) {
    await dbRun(sql);
  }
  console.log('✅ Database schema ready');
  await seedData();
}

async function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}

async function seedData() {
  // Seed soil labs
  const labCount = await dbGet("SELECT COUNT(*) as c FROM soil_labs");
  if (labCount.c === 0) {
    const labs = [
      ["AgriTest Labs, Bhopal", "Bhopal, MP", "12 Agriculture Nagar, Bhopal", "9876543210", "info@agritest.in", 4.7, 1, "NPK Test, pH Test, Micronutrient Analysis", "₹500 - ₹2000", "Mon-Sat"],
      ["Krishi Vigyan Lab", "Indore, MP", "Near ITI College, Indore", "9812345678", "kvlab@gmail.com", 4.4, 1, "Soil Health Card, Water Test, Organic Carbon", "₹300 - ₹1500", "Mon-Fri"],
      ["National Soil Testing Centre", "Delhi", "Pusa Institute, New Delhi", "1800112233", "nstc@icar.gov.in", 4.9, 1, "Complete Soil Analysis, Remote Testing", "₹200 - ₹3000", "Mon-Fri"],
      ["AgroScan Laboratories", "Pune, MH", "Hadapsar Industrial Estate", "9988776655", "agroscan@labs.in", 4.2, 1, "Heavy Metal Test, Pesticide Residue", "₹800 - ₹4000", "Mon-Sat"],
      ["GreenField Testing", "Nagpur, MH", "Civil Lines, Nagpur", "7890123456", "greenfield@test.com", 4.5, 1, "pH, EC, NPK, Micronutrients", "₹400 - ₹1800", "Mon-Sat"],
    ];
    for (const l of labs) {
      await dbRun("INSERT INTO soil_labs(name,location,address,phone,email,rating,certified,services,price_range,working_days) VALUES(?,?,?,?,?,?,?,?,?,?)", l);
    }
  }

  // Seed subsidies
  const subCount = await dbGet("SELECT COUNT(*) as c FROM subsidies");
  if (subCount.c === 0) {
    const subs = [
      ["PM-KISAN Samman Nidhi", "Ministry of Agriculture", "Direct income support of ₹6000/year to farmer families", "Small & marginal farmers with less than 2 hectares", "₹6000 per year in 3 installments", "Aadhar, Land Records, Bank Passbook", "https://pmkisan.gov.in", "31 Dec 2025", 6000, "income_support", "All"],
      ["Pradhan Mantri Fasal Bima Yojana", "Ministry of Agriculture", "Crop insurance scheme to protect farmers from crop loss", "All farmers growing notified crops", "Up to sum insured for crop loss", "Aadhar, Land Records, Bank Account, Crop Sowing Certificate", "https://pmfby.gov.in", "Rolling", 500000, "insurance", "All"],
      ["Soil Health Card Scheme", "Ministry of Agriculture", "Free soil testing and health card for all farmers", "All farmers across India", "Free soil testing + recommendations", "Aadhar, Land Details", "https://soilhealth.dac.gov.in", "Ongoing", 0, "soil_health", "All"],
      ["PM Krishi Sinchai Yojana", "Ministry of Water Resources", "Irrigation support for farmers under Har Khet Ko Pani", "Farmers without assured irrigation", "Drip/Sprinkler subsidy up to 55% for SC/ST, 45% for others", "Aadhar, Land Record, Bank Account", "https://pmksy.gov.in", "30 Sep 2025", 150000, "irrigation", "All"],
      ["Kisan Credit Card", "NABARD", "Short-term credit for cultivation expenses at low interest", "All farmers, fishermen, animal husbandry practitioners", "Credit up to ₹3 lakh at 4% interest after subvention", "Aadhar, Land Ownership, Passport Photo", "https://www.nabard.org/kcc", "Ongoing", 300000, "credit", "All"],
      ["National Mission on Oilseeds and Oil Palm", "Ministry of Agriculture", "Support to increase oilseed production in India", "Farmers in identified districts", "Seed subsidy, equipment support, training", "Land record, Aadhar, Bank Account", null, "31 Mar 2025", 50000, "production", "All"],
      ["e-NAM Portal Registration Subsidy", "Ministry of Agriculture", "Support for farmers to register and sell on e-NAM", "All farmers", "Technical support + commission waiver for 1 year", "Aadhar, Bank Account, Produce details", "https://enam.gov.in", "Ongoing", 5000, "marketing", "All"],
    ];
    for (const s of subs) {
      await dbRun("INSERT INTO subsidies(name,ministry,description,eligibility,benefits,documents,application_url,deadline,max_amount,category,state) VALUES(?,?,?,?,?,?,?,?,?,?,?)", s);
    }
  }

  // Seed machinery
  const machCount = await dbGet("SELECT COUNT(*) as c FROM machinery");
  if (machCount.c === 0) {
    const mach = [
      ["Mahindra Arjun Tractor 75HP", "tractor", "Powerful tractor suitable for plowing and cultivation on large farms", 1200, "Bhopal, MP", null, null, 1, 4.8],
      ["John Deere 5050D Tractor", "tractor", "Fuel-efficient tractor for medium farms, ideal for seeding", 1500, "Indore, MP", null, null, 1, 4.9],
      ["Kubota Paddy Harvester", "harvester", "Specialized harvester for paddy and wheat, high efficiency", 3500, "Jabalpur, MP", null, null, 1, 4.6],
      ["Massey Ferguson Combine Harvester", "harvester", "Large combine harvester for wheat and soybean harvesting", 5000, "Nagpur, MH", null, null, 1, 4.7],
      ["Rotavator (Multi-crop)", "rotavator", "Prepares soil for multiple crops, adjustable depth settings", 800, "Bhopal, MP", null, null, 1, 4.5],
      ["Power Sprayer (Knapsack)", "sprayer", "Motorized knapsack sprayer for pesticide and fertilizer application", 400, "Indore, MP", null, null, 1, 4.3],
      ["Seed Drill Machine", "seeder", "Precision seed drill for uniform seeding of wheat, maize, soybean", 900, "Pune, MH", null, null, 1, 4.6],
      ["Solar Water Pump (5HP)", "irrigation", "Solar-powered water pump for field irrigation, eco-friendly", 600, "Bhopal, MP", null, null, 1, 4.8],
    ];
    for (const m of mach) {
      await dbRun("INSERT INTO machinery(name,type,description,price_per_day,location,owner_id,image_url,is_available,rating) VALUES(?,?,?,?,?,?,?,?,?)", m);
    }
  }

  // Seed store items
  const storeCount = await dbGet("SELECT COUNT(*) as c FROM store_items");
  if (storeCount.c === 0) {
    const items = [
      ["Urea Fertilizer 50kg", "fertilizer", "High nitrogen content urea for crops", 680, "bag", "IFFCO"],
      ["DAP Fertilizer 50kg", "fertilizer", "Di-ammonium phosphate for strong root development", 1350, "bag", "IFFCO"],
      ["Potash (MOP) 50kg", "fertilizer", "Muriate of potash for fruit quality", 950, "bag", "KRIBHCO"],
      ["Vermi Compost 25kg", "organic", "Certified organic vermicompost for soil enrichment", 320, "bag", "GreenFarm"],
      ["Neem Oil Spray 1L", "pesticide", "Organic neem oil for pest control", 480, "litre", "AgroNeem"],
      ["Chlorpyrifos 20% EC 1L", "pesticide", "Broad spectrum insecticide for crop protection", 380, "litre", "Syngenta"],
      ["Hybrid Wheat Seeds 10kg", "seeds", "High yielding HD-3086 hybrid wheat seeds", 550, "kg", "NDDB"],
      ["Bt Cotton Seeds 450g", "seeds", "Bollgard-II Bt cotton seeds, 1 packet", 890, "packet", "Monsanto"],
      ["Drip Irrigation Kit (1 acre)", "equipment", "Complete drip irrigation kit for 1 acre", 8500, "kit", "Jain Irrigation"],
      ["pH Soil Meter (Digital)", "equipment", "Digital soil pH and moisture meter", 1200, "piece", "AgroTech"],
    ];
    for (const i of items) {
      await dbRun("INSERT INTO store_items(name,category,description,price,unit,brand) VALUES(?,?,?,?,?,?)", i);
    }
  }

  // Seed advisories
  const advCount = await dbGet("SELECT COUNT(*) as c FROM advisories");
  if (advCount.c === 0) {
    const advs = [
      [null, "Kharif 2025: Soybean Cultivation Advisory", "This season, sow soybean seeds at 30x10 cm spacing. Apply DAP at 100 kg/acre during sowing. Ensure proper drainage as waterlogging damages roots.", "crop", "en", "soybean,kharif,MP"],
      [null, "Wheat MSP 2024-25: ₹2,275 per Quintal", "The government has announced MSP for wheat at ₹2,275 per quintal for Rabi 2024-25. Sell through registered mandis to get MSP benefit automatically.", "market", "en", "wheat,MSP,mandi"],
      [null, "मानसून पूवानुमान 2025", "भारतीय मौसम वभाग के अनुसार इस वष मध्य प्रदेश में सामान्य से अधक वषा की संभावना है। जून के पहले सप्ताह में खरीफ की बुवाई शुरू करें।", "weather", "hi", "monsoon,MP,forecast"],
      [null, "Fall Armyworm Alert in Maize Crops", "Fall armyworm infestation reported in central India maize fields. Scout regularly. Apply Emamectin Benzoate 5% SG at 0.4 g/litre if more than 5% infestation observed.", "pest", "en", "maize,pest,armyworm"],
      [null, "Soil Health: Improving Organic Carbon", "Most Indian farm soils have less than 0.5% organic carbon. Add 5 tonnes of FYM or vermicompost per acre every season. This improves water retention and nutrient availability.", "soil", "en", "soil,organic,carbon"],
    ];
    for (const a of advs) {
      await dbRun("INSERT INTO advisories(author_id,title,content,category,language,tags) VALUES(?,?,?,?,?,?)", a);
    }
  }

  // Seed community orgs
  const orgCount = await dbGet("SELECT COUNT(*) as c FROM community_orgs");
  if (orgCount.c === 0) {
    const orgs = [
      ["Kisan Sangh MP", "Madhya Pradesh farmers' collective for crop price advocacy and support", "Bhopal, MP", "9876000001", null, "farmer_union"],
      ["AgroTech Cooperative", "Technology adoption cooperative helping small farmers access modern tools", "Indore, MP", "9876000002", "https://agrotechcoop.in", "cooperative"],
      ["Grameen Vikas Sanstha", "Rural development NGO focused on sustainable farming practices", "Jabalpur, MP", "9876000003", null, "ngo"],
      ["Organic Farmers Network India", "Promoting organic farming, certification and market linkages", "Pune, MH", "9876000004", "https://ofni.in", "network"],
      ["ICAR Farmer Club", "Knowledge-sharing club connected with ICAR research stations", "Delhi", "1800001001", "https://icar.gov.in", "government"],
    ];
    for (const o of orgs) {
      await dbRun("INSERT INTO community_orgs(name,description,location,contact,website,category) VALUES(?,?,?,?,?,?)", o);
    }
  }

  console.log('✅ Seed data ready');
}

module.exports = db;
