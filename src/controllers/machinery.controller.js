const { dbAll, dbGet, dbRun } = require('../utils/dbHelpers');

exports.getMachinery = async (req, res) => {
  try {
    const machinery = await dbAll("SELECT * FROM machinery");
    res.json(machinery);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch machinery" });
  }
};

exports.bookMachinery = async (req, res) => {
  try {
    res.json({ success: true, message: 'Machinery booked' });
  } catch (err) {
    res.status(500).json({ error: "Failed to book machinery" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await dbAll(
      `SELECT b.*, m.name as machine_name FROM machinery_bookings b JOIN machinery m ON b.machinery_id = m.id WHERE b.user_id = ?`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch machinery bookings" });
  }
};
