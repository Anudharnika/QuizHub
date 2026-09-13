const mockStore = require('../utils/mockStore');

// @desc    Get leaderboard (global)
// @route   GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'All', quizId } = req.query;
    const leaderboard = mockStore.getLeaderboard(timeframe, quizId);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

module.exports = { getLeaderboard };
