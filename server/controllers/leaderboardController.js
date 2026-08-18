const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('username xp quizzesTaken accuracy')
      .sort({ xp: -1 })
      .limit(10); // limit to top 10 players

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
