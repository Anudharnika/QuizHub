const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MCQ', 'MultiSelect', 'TrueFalse', 'FillBlank', 'ShortAnswer', 'Matching', 'Ordering', 'ImageBased'],
    default: 'MCQ'
  },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Hard'], default: 'Intermediate' },
  options: [{ type: String }],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  creator: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.QuestionBank || mongoose.model('QuestionBank', questionBankSchema);
