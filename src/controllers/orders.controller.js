const { dbAll, dbRun, dbGet } = require('../utils/dbHelpers');

exports.createOrder = async (req, res) => {
  try {
    const { product_id, quantity, payment_method, shipping_address } = req.body;
    const product = await dbGet('SELECT price, farmer_id FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    const total = product.price * quantity;
    const result = await dbRun(
      'INSERT INTO orders (buyer_id, farmer_id, product_id, quantity, price_per_unit, total, payment_method, delivery_addr) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, product.farmer_id, product_id, quantity, product.price, total, payment_method || 'card', shipping_address || '']
    );

    // Decrement stock
    await dbRun('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);

    res.json({ id: result.lastID, success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT o.*, p.name as product_name, p.price, u.name as farmer_name 
       FROM orders o JOIN products p ON o.product_id = p.id 
       JOIN users u ON p.farmer_id = u.id WHERE o.buyer_id = ? 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getFarmerOrders = async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT o.*, p.name as product_name, p.price, u.name as buyer_name 
       FROM orders o JOIN products p ON o.product_id = p.id 
       JOIN users u ON o.buyer_id = u.id WHERE o.farmer_id = ? 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;
    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, order_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await dbGet('SELECT product_id, quantity FROM orders WHERE id = ? AND buyer_id = ? AND status = "pending"', [order_id, req.user.id]);
    if (!order) return res.status(400).json({ error: 'Order cannot be cancelled' });
    
    await dbRun('UPDATE orders SET status = "cancelled" WHERE id = ?', [order_id]);
    await dbRun('UPDATE products SET quantity = quantity + ? WHERE id = ?', [order.quantity, order.product_id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
};
