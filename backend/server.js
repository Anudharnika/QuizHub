require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const mockStore = require('./utils/mockStore');

// Configure allowed origins for CORS (Vercel production, local dev, custom CLIENT_URL)
const allowedOrigins = [
  'https://quiz-hub-rho-red.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Connect to DB (non-blocking)
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'QuizHub API is running 🚀', timestamp: new Date().toISOString() });
});

// Categories endpoint (no auth needed)
app.get('/api/categories', (req, res) => {
  res.json(mockStore.categories);
});

// ============================================================
// SOCKET.IO — Real-Time Quiz Session Handler
// ============================================================
const liveSessions = {};

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // HOST: Create a live session
  socket.on('create_session', ({ quizId, hostName }) => {
    const session = mockStore.createLiveSession(quizId, socket.id);
    session.hostName = hostName;
    socket.join(session.code);
    socket.emit('session_created', { code: session.code, quiz: session.quiz });
    console.log(`[Socket] Session created: ${session.code} for quiz ${quizId}`);
  });

  // PLAYER: Join a session room
  socket.on('join_session', ({ code, playerName }) => {
    const session = mockStore.getLiveSession(code);
    if (!session) {
      socket.emit('error', { message: 'Invalid game code. Please check and try again.' });
      return;
    }
    if (session.status !== 'waiting') {
      socket.emit('error', { message: 'This game has already started. Please wait for the next session.' });
      return;
    }

    const player = { id: socket.id, name: playerName, score: 0, answers: [] };
    session.participants.push(player);
    socket.join(code);
    socket.emit('joined_session', { code, quiz: { title: session.quiz?.title, questionsCount: session.quiz?.questions?.length } });
    io.to(code).emit('participants_updated', { participants: session.participants });
    console.log(`[Socket] Player ${playerName} joined session ${code}`);
  });

  // HOST: Start the quiz
  socket.on('start_session', ({ code }) => {
    const session = mockStore.getLiveSession(code);
    if (!session) return;
    session.status = 'active';
    session.currentQuestionIndex = 0;
    const question = session.quiz?.questions?.[0];
    io.to(code).emit('quiz_started', { question: sanitizeQuestion(question), questionIndex: 0, total: session.quiz?.questions?.length });
  });

  // HOST: Next question
  socket.on('next_question', ({ code }) => {
    const session = mockStore.getLiveSession(code);
    if (!session) return;
    session.currentQuestionIndex += 1;
    const nextQ = session.quiz?.questions?.[session.currentQuestionIndex];
    if (!nextQ) {
      // Quiz over
      session.status = 'finished';
      const finalScores = session.participants.sort((a, b) => b.score - a.score);
      io.to(code).emit('quiz_ended', { scores: finalScores });
    } else {
      io.to(code).emit('next_question', { question: sanitizeQuestion(nextQ), questionIndex: session.currentQuestionIndex, total: session.quiz?.questions?.length });
    }
  });

  // PLAYER: Submit answer for live quiz
  socket.on('submit_live_answer', ({ code, questionId, answer }) => {
    const session = mockStore.getLiveSession(code);
    if (!session) return;

    const currentQ = session.quiz?.questions?.[session.currentQuestionIndex];
    if (!currentQ || currentQ.id !== questionId) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.correctAnswer)) {
      isCorrect = JSON.stringify(currentQ.correctAnswer.sort()) === JSON.stringify((Array.isArray(answer) ? answer : [answer]).sort());
    } else {
      isCorrect = answer?.toString().trim().toLowerCase() === currentQ.correctAnswer?.toString().trim().toLowerCase();
    }

    const player = session.participants.find(p => p.id === socket.id);
    if (player) {
      player.score += isCorrect ? (currentQ.points || 10) : 0;
      player.answers.push({ questionId, answer, isCorrect });
    }

    socket.emit('answer_result', { isCorrect, correctAnswer: currentQ.correctAnswer, points: isCorrect ? (currentQ.points || 10) : 0 });
    const sortedParticipants = [...session.participants].sort((a, b) => b.score - a.score);
    io.to(code).emit('leaderboard_update', { participants: sortedParticipants });
  });

  // HOST: End session early
  socket.on('end_session', ({ code }) => {
    const session = mockStore.getLiveSession(code);
    if (!session) return;
    session.status = 'finished';
    const finalScores = session.participants.sort((a, b) => b.score - a.score);
    io.to(code).emit('quiz_ended', { scores: finalScores });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

function sanitizeQuestion(q) {
  if (!q) return null;
  // Don't send correct answer to players
  const { correctAnswer, explanation, ...safe } = q;
  return safe;
}

// ============================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 QuizHub API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Mode: ${process.env.MONGODB_URI ? 'MongoDB + Mock Fallback' : 'Mock Store (instant)'}\n`);
});

module.exports = { app, io };
