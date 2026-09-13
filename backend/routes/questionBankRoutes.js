const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, getCategories } = require('../controllers/questionBankController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getQuestions);
router.post('/', protect, createQuestion);
router.get('/categories', getCategories);

module.exports = router;
