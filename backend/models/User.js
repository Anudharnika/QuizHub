const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  stats: {
    quizzesCreated: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  achievements: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
