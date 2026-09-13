const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// @desc    Submit a finished quiz attempt
// @route   POST /api/attempts
const submitAttempt = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ message: 'Quiz ID and answers array are required' });
    }

    let quiz;
    if (getMongoStatus()) {
      quiz = await Quiz.findById(quizId);
    } else {
      quiz = mockStore.getQuizById(quizId);
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Evaluate answers
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;

    const evaluatedAnswers = quiz.questions.map((q) => {
      totalPoints += q.points || 10;
      const userAns = answers[q.id];
      let isCorrect = false;

      if (userAns !== undefined && userAns !== null) {
        if (Array.isArray(q.correctAnswer)) {
          // MultiSelect or Ordering
          if (Array.isArray(userAns)) {
            isCorrect = JSON.stringify(q.correctAnswer.sort()) === JSON.stringify(userAns.sort());
          }
        } else if (typeof q.correctAnswer === 'string') {
          isCorrect = userAns.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase();
        } else {
          isCorrect = userAns === q.correctAnswer;
        }
      }

      const pointsEarned = isCorrect ? (q.points || 10) : 0;
      if (isCorrect) {
        earnedPoints += pointsEarned;
        correctCount += 1;
      }

      return {
        questionId: q.id,
        userResponse: userAns,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const accuracy = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;

    const attemptData = {
      userId: req.user._id,
      userName: req.user.name,
      quizId,
      quizTitle: quiz.title,
      score: earnedPoints,
      totalPoints,
      percentage,
      accuracy,
      timeTaken: timeTaken || 0,
      answers: evaluatedAnswers
    };

    let savedAttempt;
    if (getMongoStatus()) {
      savedAttempt = await QuizAttempt.create(attemptData);
      // update quiz counters
      const newAttempts = quiz.attemptsCount + 1;
      const newAvg = Math.round(((quiz.averageScore * quiz.attemptsCount + percentage) / newAttempts) * 10) / 10;
      await Quiz.findByIdAndUpdate(quizId, { attemptsCount: newAttempts, averageScore: newAvg });
    } else {
      savedAttempt = mockStore.saveAttempt(attemptData);
    }

    res.status(201).json(savedAttempt);
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ message: 'Error submitting quiz attempt' });
  }
};

// @desc    Get user attempts
// @route   GET /api/attempts/user
const getUserAttempts = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const attempts = await QuizAttempt.find({ userId: req.user._id }).sort({ completedAt: -1 });
      return res.json(attempts);
    } else {
      const attempts = mockStore.getAttemptsByUser(req.user._id);
      return res.json(attempts);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user attempts' });
  }
};

const getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;
    let attempt;
    if (getMongoStatus()) {
      attempt = await QuizAttempt.findById(id);
    } else {
      attempt = mockStore.getAttemptById(id);
    }
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving attempt' });
  }
};

module.exports = { submitAttempt, getUserAttempts, getAttemptById };

