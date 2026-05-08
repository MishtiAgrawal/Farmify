const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log('Checking data in key tables...\n');

// Check subsidies
db.get('SELECT COUNT(*) as count FROM subsidies', (err, row) => {
  console.log('Subsidies:', row.count);
});

// Check soil labs
db.get('SELECT COUNT(*) as count FROM soil_labs', (err, row) => {
  console.log('Soil Labs:', row.count);
});

// Check advisories
db.get('SELECT COUNT(*) as count FROM advisories', (err, row) => {
  console.log('Advisories:', row.count);
});

// Check users
db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
  console.log('Users:', row.count);
  db.close();
});