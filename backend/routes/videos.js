const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/videos'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only MP4 and WebM files are supported'));
  }
}).single('video');

router.post('/', authMiddleware, upload, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { courseId, title, category, tags } = req.body;
  const videoFile = req.file;

  if (!courseId || !title || !category || !videoFile) {
    return res.status(400).json({ error: 'Course ID, title, category, and video file are required' });
  }

  const videoUrl = `/videos/${videoFile.filename}`;
  const tagArray = tags ? JSON.parse(tags) : [];
  db.query('INSERT INTO videos (course_id, title, url, category, tags) VALUES (?, ?, ?, ?, ?)', 
    [courseId, title, videoUrl, category, JSON.stringify(tagArray)], 
    (err, result) => {
      if (err) {
        console.error('Insert video error:', err);
        return res.status(500).json({ error: 'Failed to add video' });
      }
      res.status(201).json({ id: result.insertId, courseId, title, url: videoUrl, category, tags: tagArray });
    }
  );
});

router.get('/', authMiddleware, (req, res) => {
  db.query('SELECT id, course_id, title, url, category, tags FROM videos', (err, results) => {
    if (err) {
      console.error('Fetch all videos error:', err);
      return res.status(500).json({ error: 'Failed to fetch videos' });
    }
    res.json(results.map(video => ({ ...video, tags: JSON.parse(video.tags || '[]') })));
  });
});

router.put('/:id', authMiddleware, upload, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { id } = req.params;
  const { title, category, tags } = req.body;
  const videoFile = req.file;

  const updates = { title, category, tags: tags ? JSON.parse(tags) : undefined };
  if (videoFile) updates.url = `/videos/${videoFile.filename}`;

  const fields = Object.entries(updates).filter(([_, v]) => v !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No updates provided' });

  const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
  const values = fields.map(([_, v]) => k === 'tags' ? JSON.stringify(v) : v);
  db.query(`UPDATE videos SET ${setClause} WHERE id = ?`, [...values, id], (err, result) => {
    if (err) {
      console.error('Update video error:', err);
      return res.status(500).json({ error: 'Failed to update video' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Video not found' });
    res.status(200).json({ message: 'Video updated' });
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { id } = req.params;
  db.query('DELETE FROM videos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete video error:', err);
      return res.status(500).json({ error: 'Failed to delete video' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Video not found' });
    res.status(204).send();
  });
});

module.exports = router;