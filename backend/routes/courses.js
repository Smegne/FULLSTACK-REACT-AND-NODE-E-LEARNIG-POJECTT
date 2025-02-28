const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

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

// ✅ PUBLIC ACCESS TO COURSES
router.get('/', (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Courses are now public
  });
});

// 🔒 ONLY ADMINS CAN ADD COURSES
router.post('/', authMiddleware, upload.single('thumbnail'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const { title, description, instructorId, thumbnailUrl, category } = req.body;
  const file = req.file;

  console.log('Request body:', req.body);
  console.log('File:', file);

  let finalThumbnailUrl;
  if (thumbnailUrl) {
    finalThumbnailUrl = thumbnailUrl;
  } else if (file) {
    finalThumbnailUrl = `http://localhost:5000/uploads/${file.filename}`;
  } else {
    return res.status(400).json({ error: 'Thumbnail image or URL is required' });
  }

  if (!category) return res.status(400).json({ error: 'Category is required' });

  const query = 'INSERT INTO courses (title, description, instructor_id, thumbnail_url, category) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [title, description, instructorId, finalThumbnailUrl, category], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
    res.status(201).json({ message: 'Course added', courseId: result.insertId });
  });
});

// 🔒 ONLY ADMINS CAN DELETE COURSES
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const courseId = req.params.id;
  console.log('DELETE /api/courses/:id requested, ID:', courseId);

  db.query('DELETE FROM courses WHERE id = ?', [courseId], (err, result) => {
    if (err) {
      console.error('Delete course error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  });
});

// 🔒 ONLY ADMINS CAN EDIT COURSES - ADDED HERE
router.put('/:id', authMiddleware, upload.single('thumbnail'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const courseId = req.params.id;
  const { title, description, instructorId, thumbnail_url, category } = req.body;
  const file = req.file;

  console.log('PUT /api/courses/:id requested, ID:', courseId, 'Body:', req.body, 'File:', file);

  let finalThumbnailUrl;
  if (thumbnail_url) {
    finalThumbnailUrl = thumbnail_url;
  } else if (file) {
    finalThumbnailUrl = `http://localhost:5000/uploads/${file.filename}`;
  } else {
    finalThumbnailUrl = null; // Retain existing if no new upload
  }

  const query = 'UPDATE courses SET title = ?, description = ?, instructor_id = ?, thumbnail_url = COALESCE(?, thumbnail_url), category = ? WHERE id = ?';
  db.query(query, [title, description, instructorId, finalThumbnailUrl, category, courseId], (err, result) => {
    if (err) {
      console.error('Update course error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course updated' });
  });
});

module.exports = router;