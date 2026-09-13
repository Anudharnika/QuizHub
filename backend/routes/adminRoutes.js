const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, adminDeleteQuiz, updateProfile } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.delete('/quizzes/:id', protect, admin, adminDeleteQuiz);
router.put('/users/profile', protect, updateProfile);

module.exports = router;
