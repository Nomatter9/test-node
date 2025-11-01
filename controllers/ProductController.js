const db = require('../config/db');

class ProductController {
  // Get all products
  async index(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching products' 
      });
    }
  }
  
  // Get single product
  async show(req, res) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM products WHERE id = ?', 
        [req.params.id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching product' 
      });
    }
  }
  
  // Create product
  async store(req, res) {
    try {
      const { name, description, price, quantity } = req.body;
      
      if (!name || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name and price are required' 
        });
      }
      
      const [result] = await db.query(
        'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
        [name, description || null, price, quantity || 0]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Product created successfully',
        data: { 
          id: result.insertId, 
          name, 
          description, 
          price, 
          quantity 
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating product' 
      });
    }
  }
  
  // Update product
  async update(req, res) {
    try {
      const { name, description, price, quantity } = req.body;
      const { id } = req.params;
      
      const [result] = await db.query(
        'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
        [name, description, price, quantity, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Product updated successfully',
        data: { id, name, description, price, quantity }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating product' 
      });
    }
  }
  
  // Delete product
  async destroy(req, res) {
    try {
      const [result] = await db.query(
        'DELETE FROM products WHERE id = ?', 
        [req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting product' 
      });
    }
  }
}

module.exports = new ProductController();
