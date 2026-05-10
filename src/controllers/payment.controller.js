const { dbRun, dbGet } = require('../utils/dbHelpers');

exports.processPayment = async (req, res) => {
  try {
    const { order_id, amount, method = "upi", upi_id, card_last4 } = req.body;
    if (!order_id || !amount) return res.status(400).json({ error: "order_id and amount are required" });

    const order = await dbGet("SELECT * FROM orders WHERE id = ? AND buyer_id = ?", [order_id, req.user.id]);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.payment_status === "paid") return res.status(400).json({ error: "Order already paid" });

    const txnRef = `FRM${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const success = Math.random() > 0.02;

    if (!success) {
      return res.status(402).json({ error: "Payment failed. Please try again or use a different payment method." });
    }

    await dbRun(
      "INSERT INTO payments(order_id,user_id,amount,method,status,txn_ref) VALUES(?,?,?,?,?,?)",
      [order_id, req.user.id, Number(amount), method, "success", txnRef]
    );

    await dbRun(
      "UPDATE orders SET payment_status = 'paid', payment_id = ?, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [txnRef, order_id]
    );

    res.json({
      success: true,
      message: "Payment successful! Your order is confirmed.",
      transaction: { ref: txnRef, amount: Number(amount), method, status: "success" },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment processing failed" });
  }
};
