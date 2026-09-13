const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const Quiz = require('../models/Quiz');

// @desc    Get all public quizzes with optional filters
// @route   GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const { search, category, difficulty, sort } = req.query;

    if (getMongoStatus()) {
      let query = { visibility: 'Public' };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      if (category && category !== 'All') query.category = category;
      if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

      let sortOptions = { createdAt: -1 };
      if (sort === 'popular') sortOptions = { attemptsCount: -1 };
      if (sort === 'rating') sortOptions = { rating: -1 };

      const quizzes = await Quiz.find(query).sort(sortOptions);
      return res.json(quizzes);
    } else {
      const quizzes = mockStore.getQuizzes({ search, category, difficulty, sort });
      return res.json(quizzes);
    }
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Error retrieving quizzes' });
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    let quiz;

    if (getMongoStatus()) {
      quiz = await Quiz.findById(id);
    } else {
      quiz = mockStore.getQuizById(id);
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving quiz details' });
  }
};

// @desc    Create new quiz
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    if (!quizData.title || !quizData.questions || quizData.questions.length === 0) {
      return res.status(400).json({ message: 'Quiz title and at least 1 question are required' });
    }

    const creatorInfo = {
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    };

    if (getMongoStatus()) {
      const newQuiz = await Quiz.create({
        ...quizData,
        creator: creatorInfo
      });
      return res.status(201).json(newQuiz);
    } else {
      const newQuiz = mockStore.createQuiz({
        ...quizData,
        creator: creatorInfo
      });
      return res.status(201).json(newQuiz);
    }
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
};

// @desc    Update existing quiz
// @route   PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getMongoStatus()) {
      const quiz = await Quiz.findById(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      if (quiz.creator._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this quiz' });
      }

      const updatedQuiz = await Quiz.findByIdAndUpdate(id, updates, { new: true });
      return res.json(updatedQuiz);
    } else {
      const quiz = mockStore.getQuizById(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      if (quiz.creator._id !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this quiz' });
      }

      const updated = mockStore.updateQuiz(id, updates);
      return res.json(updated);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz' });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const quiz = await Quiz.findById(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      if (quiz.creator._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this quiz' });
      }
      await Quiz.findByIdAndDelete(id);
      return res.json({ message: 'Quiz deleted successfully' });
    } else {
      const quiz = mockStore.getQuizById(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      if (quiz.creator._id !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this quiz' });
      }
      mockStore.deleteQuiz(id);
      return res.json({ message: 'Quiz deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz' });
  }
};

module.exports = { getQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz };
