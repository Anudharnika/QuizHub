const mockStore = require('../utils/mockStore');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = mockStore.users.length;
    const totalQuizzes = mockStore.quizzes.length;
    const totalAttempts = mockStore.attempts.length;
    const activeUsers = mockStore.users.filter(u => u.stats.quizzesTaken > 0).length;

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
      activeUsers,
      recentUsers: mockStore.users.slice(-5).reverse(),
      recentQuizzes: mockStore.quizzes.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

// @desc    Admin get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = mockStore.users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Admin delete quiz
// @route   DELETE /api/admin/quizzes/:id
const adminDeleteQuiz = async (req, res) => {
  try {
    mockStore.deleteQuiz(req.params.id);
    res.json({ message: 'Quiz deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updated = mockStore.updateUser(req.user._id, { name, bio, avatar });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    const { password, ...rest } = updated;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = { getAdminStats, getAllUsers, adminDeleteQuiz, updateProfile };
