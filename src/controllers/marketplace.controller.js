const { dbAll, dbRun, dbGet } = require('../utils/dbHelpers');

exports.getMarketplace = async (req, res) => {
  try {
    const { q, category } = req.query;
    let sql = `SELECT p.*, u.name as farmer_name FROM products p JOIN users u ON p.farmer_id = u.id WHERE p.is_active = 1`;
    const params = [];

    if (q) { sql += " AND p.name LIKE ?"; params.push(`%${q}%`); }
    if (category) { sql += " AND p.category = ?"; params.push(category); }

    const products = await dbAll(sql, params);
    // Map image_url to image
    const mapped = products.map(p => ({ ...p, image: p.image_url || '' }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch marketplace" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    // Note: frontend sends 'productImage' file, but here we expect JSON or handled by multer in routes
    const image = req.file ? req.file.path : '';
    
    const result = await dbRun(
      "INSERT INTO products(farmer_id,name,category,price,quantity,image_url) VALUES(?,?,?,?,?,?)",
      [req.user.id, name, category || "other", Number(price), Number(quantity) || 0, image]
    );
    res.json({ id: result.lastID, success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to list product" });
  }
};

exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await dbAll("SELECT * FROM products WHERE farmer_id = ?", [req.user.id]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const result = await dbRun(
      `UPDATE products SET name=?, category=?, price=?, quantity=? WHERE id=? AND farmer_id=?`,
      [name, category, Number(price), Number(quantity), req.params.id, req.user.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await dbRun("DELETE FROM products WHERE id = ? AND farmer_id = ?", [req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT c.id, c.quantity, p.id as product_id, p.name as product_name, p.price, p.image_url as image 
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.buyer_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: { items: rows || [] } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const existing = await dbGet('SELECT id FROM cart WHERE buyer_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing) {
      await dbRun('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await dbRun('INSERT INTO cart (buyer_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    await dbRun('UPDATE cart SET quantity = ? WHERE id = ? AND buyer_id = ?', [Number(quantity), req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart" });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    await dbRun("DELETE FROM cart WHERE id = ? AND buyer_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await dbRun("DELETE FROM cart WHERE buyer_id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
