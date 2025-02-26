const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const { courseId } = req.query;
  db.query('SELECT * FROM lessons WHERE course_id = ?', [courseId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;