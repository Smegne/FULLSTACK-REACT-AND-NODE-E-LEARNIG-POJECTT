const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `carousel-${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
});

// Get all carousel images
router.get('/', (req, res) => {
  db.query('SELECT * FROM carousel_images ORDER BY id ASC', (err, results) => {
    if (err) {
      console.error('Get carousel error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new carousel image
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Image is required' });

  const imageUrl = `http://localhost:5000/uploads/${file.filename}`;
  const query = 'INSERT INTO carousel_images (image_url) VALUES (?)';
  db.query(query, [imageUrl], (err, result) => {
    if (err) {
      console.error('Add carousel error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Image added', id: result.insertId, image_url: imageUrl });
  });
});

// Update a carousel image
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Image is required' });

  const imageUrl = `http://localhost:5000/uploads/${file.filename}`;
  const query = 'UPDATE carousel_images SET image_url = ? WHERE id = ?';
  db.query(query, [imageUrl, id], (err, result) => {
    if (err) {
      console.error('Update carousel error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image updated', image_url: imageUrl });
  });
});

// Delete a carousel image
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  const { id } = req.params;

  const query = 'DELETE FROM carousel_images WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Delete carousel error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image deleted' });
  });
});

module.exports = router;