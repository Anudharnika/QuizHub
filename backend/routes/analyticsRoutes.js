const express = require('express');
const router = express.Router();
const { getQuizAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getUserAnalytics);
router.get('/quiz/:quizId', protect, getQuizAnalytics);

module.exports = router;
