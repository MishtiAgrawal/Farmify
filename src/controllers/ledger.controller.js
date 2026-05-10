const { dbAll, dbRun } = require('../utils/dbHelpers');

exports.getLedger = async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    let sql = "SELECT *, created_at as timestamp FROM ledger WHERE user_id = ?";
    const params = [req.user.id];
    if (type)     { sql += " AND type = ?"; params.push(type); }
    if (category) { sql += " AND category = ?"; params.push(category); }
    if (from)     { sql += " AND date >= ?"; params.push(from); }
    if (to)       { sql += " AND date <= ?"; params.push(to); }
    sql += " ORDER BY date DESC, created_at DESC";

    const entries = await dbAll(sql, params);
    const summary = entries.reduce((s, e) => {
      if (e.type === "Income") s.totalIncome += e.amount;
      else s.totalExpense += e.amount;
      return s;
    }, { totalIncome: 0, totalExpense: 0 });
    summary.netProfit = summary.totalIncome - summary.totalExpense;

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ledger" });
  }
};

exports.createLedgerEntry = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;
    if (!type || !amount || !date) return res.status(400).json({ error: "type, amount, date are required" });
    if (!["Income", "Expense"].includes(type)) return res.status(400).json({ error: "type must be 'Income' or 'Expense'" });

    const result = await dbRun(
      "INSERT INTO ledger(user_id,type,category,amount,description,date) VALUES(?,?,?,?,?,?)",
      [req.user.id, type, category || "other", Number(amount), description || null, date]
    );
    res.status(201).json({ success: true, message: "Entry added", entryId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: "Failed to add ledger entry" });
  }
};

exports.deleteLedgerEntry = async (req, res) => {
  try {
    const result = await dbRun("DELETE FROM ledger WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
};
