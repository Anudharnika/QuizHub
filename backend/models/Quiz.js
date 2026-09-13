const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MCQ', 'MultiSelect', 'TrueFalse', 'FillBlank', 'ShortAnswer', 'Matching', 'Ordering', 'ImageBased'],
    default: 'MCQ'
  },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: mongoose.Schema.Types.Mixed,
  points: { type: Number, default: 10 },
  explanation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Hard'], default: 'Intermediate' },
  tags: [{ type: String }]
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, default: 'General Knowledge' },
  difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Hard'], default: 'Intermediate' },
  coverImage: { type: String, default: '' },
  tags: [{ type: String }],
  timeLimit: { type: Number, default: 15 }, // minutes
  passingScore: { type: Number, default: 70 }, // percentage
  visibility: { type: String, enum: ['Public', 'Private', 'Unlisted'], default: 'Public' },
  creator: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  attemptsCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  settings: {
    randomizeQuestions: { type: Boolean, default: false },
    randomizeAnswers: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    showExplanations: { type: Boolean, default: true },
    allowRetakes: { type: Boolean, default: true },
    showLeaderboard: { type: Boolean, default: true }
  },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
