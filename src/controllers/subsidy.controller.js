const { dbAll, dbGet, dbRun } = require('../utils/dbHelpers');

exports.getSubsidies = async (req, res) => {
  try {
    const subsidies = await dbAll("SELECT * FROM subsidies");
    res.json(subsidies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subsidies" });
  }
};

exports.getSubsidyById = async (req, res) => {
  try {
    const subsidy = await dbGet("SELECT * FROM subsidies WHERE id = ?", [req.params.id]);
    res.json(subsidy);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subsidy" });
  }
};

exports.applySubsidy = async (req, res) => {
  try {
    res.json({ success: true, message: 'Subsidy application submitted' });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit application" });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const apps = await dbAll(
      `SELECT sa.*, s.name as subsidy_name FROM subsidy_applications sa JOIN subsidies s ON sa.subsidy_id = s.id WHERE sa.user_id = ?`,
      [req.user.id]
    );
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};
