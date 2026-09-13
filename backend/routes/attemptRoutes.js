const express = require('express');
const router = express.Router();
const { submitAttempt, getUserAttempts, getAttemptById } = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitAttempt);
router.get('/user', protect, getUserAttempts);
router.get('/:id', protect, getAttemptById);

module.exports = router;
