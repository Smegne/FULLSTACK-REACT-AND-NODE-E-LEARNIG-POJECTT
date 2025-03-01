const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Create assessment with questions (admin only)
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { courseId, title, questions } = req.body;
  if (!courseId || !title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Course ID, title, and questions array are required' });
  }

  // Validate questions format
  for (const q of questions) {
    if (!q.question_text || !q.correct_answer) {
      return res.status(400).json({ error: 'Each question must have text and a correct answer' });
    }
    if (q.type === 'multiple-choice') {
      if (!q.choices || !Array.isArray(q.choices) || q.choices.length < 2 || !q.choices.includes(q.correct_answer)) {
        return res.status(400).json({ error: 'Multiple-choice questions must have at least two options and a valid correct answer' });
      }
    }
  }

  // Verify course exists
  db.query('SELECT id FROM courses WHERE id = ?', [courseId], (err, courseResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to verify course' });
    }
    if (courseResults.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Insert assessment
    db.query('INSERT INTO assessments (course_id, title) VALUES (?, ?)', [courseId, title], (err, result) => {
      if (err) {
        console.error('Create assessment error:', err);
        return res.status(500).json({ error: 'Failed to create assessment' });
      }
      const assessmentId = result.insertId;

      // Insert questions with type and choices
      const questionValues = questions.map(q => [
        assessmentId,
        q.question_text,
        q.correct_answer,
        q.type || 'short-answer', // Default to short-answer if not specified
        q.choices ? JSON.stringify(q.choices) : null // JSON.stringify for choices array
      ]);
      db.query('INSERT INTO questions (assessment_id, question_text, correct_answer, type, choices) VALUES ?', [questionValues], (err) => {
        if (err) {
          console.error('Add questions error:', err);
          return res.status(500).json({ error: 'Failed to add questions' });
        }
        res.status(201).json({ message: 'Assessment created', assessmentId });
      });
    });
  });
});

// Get assessments for a course (used by dashboard)
router.get('/course/:courseId', authMiddleware, (req, res) => {
  const courseId = req.params.courseId;
  db.query(`
    SELECT a.id, a.title, q.id AS question_id, q.question_text, q.correct_answer, q.type, q.choices 
    FROM assessments a 
    LEFT JOIN questions q ON a.id = q.assessment_id 
    WHERE a.course_id = ?
  `, [courseId], (err, results) => {
    if (err) {
      console.error('Fetch assessments error:', err);
      return res.status(500).json({ error: 'Failed to fetch assessments' });
    }
    const assessments = {};
    results.forEach(row => {
      if (!assessments[row.id]) {
        assessments[row.id] = { id: row.id, title: row.title, questions: [] };
      }
      if (row.question_id) {
        assessments[row.id].questions.push({
          id: row.question_id,
          question_text: row.question_text,
          correct_answer: row.correct_answer,
          type: row.type || 'short-answer', // Ensure type is always returned
          choices: row.choices ? JSON.parse(row.choices) : [] // Parse JSON choices if present
        });
      }
    });
    res.json(Object.values(assessments));
  });
});

// Submit student response
router.post('/response', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { questionId, studentAnswer } = req.body;
  if (!questionId || !studentAnswer) {
    return res.status(400).json({ error: 'Question ID and answer are required' });
  }

  db.query(`
    INSERT INTO student_responses (user_id, question_id, student_answer) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE student_answer = ?
  `, [userId, questionId, studentAnswer, studentAnswer], (err) => {
    if (err) {
      console.error('Submit response error:', err);
      return res.status(500).json({ error: 'Failed to submit response' });
    }
    res.status(201).json({ message: 'Response submitted' });
  });
});

// Get student progress report
router.get('/progress/:courseId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.courseId;
  db.query(`
    SELECT a.id AS assessment_id, a.title, q.id AS question_id, q.question_text, q.correct_answer, q.type, q.choices,
           sr.student_answer, sr.submitted_at
    FROM assessments a
    JOIN questions q ON a.id = q.assessment_id
    LEFT JOIN student_responses sr ON q.id = sr.question_id AND sr.user_id = ?
    WHERE a.course_id = ?
  `, [userId, courseId], (err, results) => {
    if (err) {
      console.error('Fetch progress error:', err);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
    const progress = {};
    results.forEach(row => {
      if (!progress[row.assessment_id]) {
        progress[row.assessment_id] = { id: row.assessment_id, title: row.title, questions: [] };
      }
      progress[row.assessment_id].questions.push({
        id: row.question_id,
        question_text: row.question_text,
        correct_answer: row.correct_answer,
        type: row.type || 'short-answer',
        choices: row.choices ? JSON.parse(row.choices) : [],
        student_answer: row.student_answer,
        submitted_at: row.submitted_at,
        is_correct: row.student_answer === row.correct_answer
      });
    });
    res.json(Object.values(progress));
  });
});

module.exports = router;