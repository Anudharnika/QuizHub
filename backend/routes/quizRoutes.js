const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', protect, createQuiz);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;
