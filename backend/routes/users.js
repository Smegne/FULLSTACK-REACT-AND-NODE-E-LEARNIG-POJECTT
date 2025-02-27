const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const SECRET = process.env.JWT_SECRET || 'secret';

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
});

// Public signup endpoint
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, 'student'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email already exists' });
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Signup failed due to server error' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed due to server error' });
  }
});

// Public login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login request:', req.body);
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, profile_image: user.profile_image } });
  });
});

// Admin-only registration
router.post('/register', authMiddleware, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, role || 'student'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email already exists' });
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Registration failed due to server error' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed due to server error' });
  }
});

// Fetch all users (admin only)
router.get('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  db.query('SELECT id, username, email, role, profile_image FROM users', (err, results) => {
    if (err) {
      console.error('Fetch users error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Update user profile image
router.put('/profile', authMiddleware, upload.single('profileImage'), (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Profile image is required' });

  const imageUrl = `http://localhost:5000/uploads/${file.filename}`;
  const query = 'UPDATE users SET profile_image = ? WHERE id = ?';
  db.query(query, [imageUrl, userId], (err, result) => {
    if (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ error: 'Failed to update profile image' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    db.query('SELECT id, username, email, role, profile_image FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile image updated', user: results[0] });
    });
  });
});

// Fetch current user
router.get('/me', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, username, email, role, profile_image FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

module.exports = router;