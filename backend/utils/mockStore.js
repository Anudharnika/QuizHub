const {
  initialUsers,
  initialQuizzes,
  initialQuestionBank,
  initialAttempts,
  initialAchievements,
  initialNotifications
} = require('./initialData');

class MockStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.quizzes = JSON.parse(JSON.stringify(initialQuizzes));
    this.questionBank = JSON.parse(JSON.stringify(initialQuestionBank));
    this.attempts = JSON.parse(JSON.stringify(initialAttempts));
    this.achievements = JSON.parse(JSON.stringify(initialAchievements));
    this.notifications = JSON.parse(JSON.stringify(initialNotifications));
    this.liveSessions = {};
    this.categories = [
      'Programming',
      'Mathematics',
      'Science',
      'General Knowledge',
      'History',
      'Aptitude',
      'AI & ML',
      'Web Development'
    ];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
      bio: 'QuizHub Enthusiast',
      stats: { quizzesCreated: 0, quizzesTaken: 0, averageScore: 0 },
      achievements: ['ach_1'],
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u._id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return null;
  }

  // Quizzes
  getQuizzes({ search, category, difficulty, sort } = {}) {
    let list = [...this.quizzes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category && category !== 'All') {
      list = list.filter(item => item.category === category);
    }
    if (difficulty && difficulty !== 'All') {
      list = list.filter(item => item.difficulty === difficulty);
    }
    if (sort === 'popular') {
      list.sort((a, b) => b.attemptsCount - a.attemptsCount);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }

  getQuizById(id) {
    return this.quizzes.find(q => q._id === id);
  }

  createQuiz(quizData) {
    const newQuiz = {
      _id: 'qz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      attemptsCount: 0,
      averageScore: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      questions: quizData.questions || [],
      settings: quizData.settings || {
        randomizeQuestions: false,
        randomizeAnswers: false,
        showCorrectAnswers: true,
        showExplanations: true,
        allowRetakes: true,
        showLeaderboard: true
      },
      ...quizData
    };
    this.quizzes.unshift(newQuiz);
    return newQuiz;
  }

  updateQuiz(id, updates) {
    const idx = this.quizzes.findIndex(q => q._id === id);
    if (idx !== -1) {
      this.quizzes[idx] = { ...this.quizzes[idx], ...updates };
      return this.quizzes[idx];
    }
    return null;
  }

  deleteQuiz(id) {
    const idx = this.quizzes.findIndex(q => q._id === id);
    if (idx !== -1) {
      this.quizzes.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Question Bank
  getQuestionBank({ category, difficulty, search } = {}) {
    let list = [...this.questionBank];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item => item.questionText.toLowerCase().includes(q));
    }
    if (category && category !== 'All') {
      list = list.filter(item => item.category === category);
    }
    if (difficulty && difficulty !== 'All') {
      list = list.filter(item => item.difficulty === difficulty);
    }
    return list;
  }

  addQuestionBankItem(item) {
    const newItem = {
      _id: 'qb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      ...item
    };
    this.questionBank.unshift(newItem);
    return newItem;
  }

  // Attempts
  saveAttempt(attemptData) {
    const newAttempt = {
      _id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      completedAt: new Date().toISOString(),
      ...attemptData
    };
    this.attempts.unshift(newAttempt);

    // Update Quiz stats
    const quiz = this.getQuizById(attemptData.quizId);
    if (quiz) {
      const newCount = quiz.attemptsCount + 1;
      const newAvg = Math.round(((quiz.averageScore * quiz.attemptsCount + attemptData.percentage) / newCount) * 10) / 10;
      this.updateQuiz(quiz._id, { attemptsCount: newCount, averageScore: newAvg });
    }

    return newAttempt;
  }

  getAttemptsByUser(userId) {
    return this.attempts.filter(a => a.userId === userId);
  }

  getAttemptsByQuiz(quizId) {
    return this.attempts.filter(a => a.quizId === quizId);
  }

  getAttemptById(id) {
    return this.attempts.find(a => a._id === id);
  }

  // Leaderboard
  getLeaderboard(timeframe = 'All') {
    // Calculate leaderboard rankings based on total points and average score
    const userMap = {};
    this.attempts.forEach(att => {
      if (!userMap[att.userId]) {
        userMap[att.userId] = {
          userId: att.userId,
          name: att.userName || 'Anonymous',
          avatar: this.findUserById(att.userId)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
          totalPoints: 0,
          totalQuizzes: 0,
          percentages: []
        };
      }
      userMap[att.userId].totalPoints += att.score;
      userMap[att.userId].totalQuizzes += 1;
      userMap[att.userId].percentages.push(att.percentage);
    });

    const leaderboard = Object.values(userMap).map(user => {
      const avgAcc = Math.round(user.percentages.reduce((a, b) => a + b, 0) / user.percentages.length);
      return {
        ...user,
        accuracy: avgAcc,
        score: user.totalPoints
      };
    });

    leaderboard.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
    return leaderboard.map((entry, idx) => ({ rank: idx + 1, ...entry }));
  }

  // Live Sessions
  createLiveSession(quizId, hostId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const quiz = this.getQuizById(quizId);
    const session = {
      code,
      quizId,
      quiz,
      hostId,
      status: 'waiting', // waiting, active, finished
      currentQuestionIndex: 0,
      participants: [],
      scores: {}
    };
    this.liveSessions[code] = session;
    return session;
  }

  getLiveSession(code) {
    return this.liveSessions[code];
  }

  // Notifications
  getNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'usr_admin');
  }

  addNotification(notif) {
    const newN = {
      _id: 'notif_' + Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    this.notifications.unshift(newN);
    return newN;
  }
}

const mockStore = new MockStore();

module.exports = mockStore;
