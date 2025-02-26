const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
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

router.get('/', authMiddleware, (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.post('/', authMiddleware, upload.single('thumbnail'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  const { title, description, instructorId, thumbnailUrl } = req.body;
  const file = req.file;

  console.log('Request body:', req.body);
  console.log('File:', file);

  let finalThumbnailUrl;
  if (thumbnailUrl) {
    finalThumbnailUrl = thumbnailUrl;
  } else if (file) {
    finalThumbnailUrl = `http://localhost:5000/uploads/${file.filename}`; // Full URL
  } else {
    return res.status(400).json({ error: 'Thumbnail image or URL is required' });
  }

  const query = 'INSERT INTO courses (title, description, instructor_id, thumbnail_url) VALUES (?, ?, ?, ?)';
  db.query(query, [title, description, instructorId, finalThumbnailUrl], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
    res.status(201).json({ message: 'Course added', courseId: result.insertId });
  });
});

module.exports = router;