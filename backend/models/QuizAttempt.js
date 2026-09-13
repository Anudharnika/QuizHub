const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: 'Anonymous' },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // in seconds
  completedAt: { type: Date, default: Date.now },
  answers: [
    {
      questionId: String,
      userResponse: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      pointsEarned: Number
    }
  ]
});

module.exports = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);
