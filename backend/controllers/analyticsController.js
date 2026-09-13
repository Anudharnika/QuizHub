const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// @desc    Get analytics for a specific quiz
// @route   GET /api/analytics/quiz/:quizId
const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    let quiz;
    let attempts;

    if (getMongoStatus()) {
      quiz = await Quiz.findById(quizId);
      attempts = await QuizAttempt.find({ quizId });
    } else {
      quiz = mockStore.getQuizById(quizId);
      attempts = mockStore.getAttemptsByQuiz(quizId);
    }

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate question-level analytics
    const questionStats = {};
    quiz.questions.forEach(q => {
      questionStats[q.id] = { questionText: q.questionText, correct: 0, wrong: 0, skipped: 0, total: 0 };
    });

    attempts.forEach(att => {
      att.answers.forEach(ans => {
        if (questionStats[ans.questionId]) {
          questionStats[ans.questionId].total += 1;
          if (ans.isCorrect) {
            questionStats[ans.questionId].correct += 1;
          } else if (ans.userResponse === null || ans.userResponse === undefined || ans.userResponse === '') {
            questionStats[ans.questionId].skipped += 1;
          } else {
            questionStats[ans.questionId].wrong += 1;
          }
        }
      });
    });

    const questionAnalytics = Object.entries(questionStats).map(([id, stats]) => ({
      questionId: id,
      questionText: stats.questionText,
      correct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      wrong: stats.total > 0 ? Math.round((stats.wrong / stats.total) * 100) : 0,
      skipped: stats.total > 0 ? Math.round((stats.skipped / stats.total) * 100) : 0,
      totalResponses: stats.total
    }));

    const sortedByCorrect = [...questionAnalytics].sort((a, b) => b.correct - a.correct);
    const easiestQuestion = sortedByCorrect[0];
    const hardestQuestion = sortedByCorrect[sortedByCorrect.length - 1];

    // Score distribution
    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];
    attempts.forEach(att => {
      const pct = att.percentage;
      if (pct <= 20) distribution[0].count++;
      else if (pct <= 40) distribution[1].count++;
      else if (pct <= 60) distribution[2].count++;
      else if (pct <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // Activity over last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayAttempts = attempts.filter(att => {
        const d = new Date(att.completedAt);
        return d >= dayStart && d <= dayEnd;
      });
      activityData.push({ date: dayStr, attempts: dayAttempts.length, avgScore: dayAttempts.length > 0 ? Math.round(dayAttempts.reduce((s, a) => s + a.percentage, 0) / dayAttempts.length) : 0 });
    }

    const completionRate = attempts.length > 0 ? Math.round((attempts.filter(a => a.percentage >= quiz.passingScore).length / attempts.length) * 100) : 0;
    const avgTime = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.timeTaken, 0) / attempts.length) : 0;

    res.json({
      quiz: { title: quiz.title, category: quiz.category, difficulty: quiz.difficulty },
      overview: {
        totalAttempts: attempts.length,
        averageScore: quiz.averageScore,
        completionRate,
        avgTimeTaken: avgTime
      },
      questionAnalytics,
      easiestQuestion,
      hardestQuestion,
      scoreDistribution: distribution,
      activityData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching quiz analytics' });
  }
};

// @desc    Get user's personal analytics/dashboard stats
// @route   GET /api/analytics/me
const getUserAnalytics = async (req, res) => {
  try {
    let attempts;
    let quizzes;

    if (getMongoStatus()) {
      attempts = await QuizAttempt.find({ userId: req.user._id }).sort({ completedAt: -1 });
      quizzes = await Quiz.find({ 'creator._id': req.user._id });
    } else {
      attempts = mockStore.getAttemptsByUser(req.user._id);
      quizzes = mockStore.getQuizzes().filter(q => q.creator._id === req.user._id);
    }

    const totalQuizzesTaken = attempts.length;
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
    const totalParticipants = quizzes.reduce((s, q) => s + q.attemptsCount, 0);

    // Activity last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(new Date(date).setHours(0, 0, 0, 0));
      const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));
      const dayAttempts = attempts.filter(att => {
        const d = new Date(att.completedAt);
        return d >= dayStart && d <= dayEnd;
      });
      activityData.push({ day: dayStr, quizzes: dayAttempts.length, score: dayAttempts.length > 0 ? Math.round(dayAttempts.reduce((s, a) => s + a.percentage, 0) / dayAttempts.length) : 0 });
    }

    res.json({
      totalQuizzesCreated: quizzes.length,
      totalQuizzesTaken,
      averageScore: avgScore,
      totalParticipants,
      recentAttempts: attempts.slice(0, 5),
      activityData,
      recentQuizzes: quizzes.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user analytics' });
  }
};

module.exports = { getQuizAnalytics, getUserAnalytics };
