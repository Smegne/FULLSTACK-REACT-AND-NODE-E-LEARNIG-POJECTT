const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.query(
    'SELECT p.id, l.title as lesson_title, p.completed FROM progress p JOIN lessons l ON p.lesson_id = l.id WHERE p.user_id = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

module.exports = router;