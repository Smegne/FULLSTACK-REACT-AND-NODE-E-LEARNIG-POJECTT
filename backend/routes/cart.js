const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Add course to cart
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  db.query('SELECT id, title, thumbnail_url, category FROM courses WHERE id = ?', [courseId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch course' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = results[0];
    const query = `
      INSERT INTO cart (user_id, course_id, title, thumbnail_url, category)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE added_at = CURRENT_TIMESTAMP
    `;
    db.query(query, [userId, courseId, course.title, course.thumbnail_url, course.category], (err, result) => {
      if (err) {
        console.error('Add to cart error:', err);
        return res.status(500).json({ error: 'Failed to add to cart' });
      }
      res.status(201).json({ message: 'Course added to cart' });
    });
  });
});

// Get user's cart
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT * FROM cart WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Fetch cart error:', err);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
    res.json(results);
  });
});

// Remove course from cart
router.delete('/:courseId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.courseId;
  db.query('DELETE FROM cart WHERE user_id = ? AND course_id = ?', [userId, courseId], (err, result) => {
    if (err) {
      console.error('Remove from cart error:', err);
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found in cart' });
    }
    res.json({ message: 'Course removed from cart' });
  });
});

module.exports = router;