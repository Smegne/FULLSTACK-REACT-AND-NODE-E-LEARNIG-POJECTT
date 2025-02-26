const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'secret';

// User Registration (already exists, adjusted for admin use)
router.post('/register', authMiddleware, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, role || 'student'], (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch All Users (new endpoint)
router.get('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  db.query('SELECT id, username, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// User Login (already exists)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

module.exports = router;