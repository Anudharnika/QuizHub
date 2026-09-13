const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const QuestionBank = require('../models/QuestionBank');

const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    if (getMongoStatus()) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
      if (search) query.questionText = { $regex: search, $options: 'i' };

      const questions = await QuestionBank.find(query).sort({ createdAt: -1 });
      return res.json(questions);
    } else {
      const questions = mockStore.getQuestionBank({ category, difficulty, search });
      return res.json(questions);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Question Bank' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { questionText, type, category, difficulty, options, correctAnswer, explanation, tags } = req.body;

    if (!questionText || !category) {
      return res.status(400).json({ message: 'Question text and category are required' });
    }

    if (getMongoStatus()) {
      const newQuestion = await QuestionBank.create({
        questionText,
        type: type || 'MCQ',
        category,
        difficulty: difficulty || 'Intermediate',
        options: options || [],
        correctAnswer,
        explanation: explanation || '',
        tags: tags || [],
        creator: req.user._id
      });
      return res.status(201).json(newQuestion);
    } else {
      const newQuestion = mockStore.addQuestionBankItem({
        questionText,
        type: type || 'MCQ',
        category,
        difficulty: difficulty || 'Intermediate',
        options: options || [],
        correctAnswer,
        explanation: explanation || '',
        tags: tags || [],
        creator: req.user._id
      });
      return res.status(201).json(newQuestion);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding question to Question Bank' });
  }
};

const getCategories = async (req, res) => {
  try {
    res.json(mockStore.categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

module.exports = { getQuestions, createQuestion, getCategories };
