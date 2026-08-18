const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Submit a quiz attempt
// @route   POST /api/attempts
// @access  Private
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers: [{ questionId, selectedOptionIndex }]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid format for answers' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let score = 0;
    let maxScore = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Process each question
    quiz.questions.forEach((q) => {
      maxScore += q.points;
      
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      
      if (userAnswer && userAnswer.selectedOptionIndex === q.correctAnswerIndex) {
        score += q.points;
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const xpGained = score; // XP is proportional to score
    const totalQuestions = quiz.questions.length;
    const attemptAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Create the attempt record
    const attempt = await Attempt.create({
      user: req.user.id,
      quiz: quizId,
      score,
      maxScore,
      xpGained,
      correctAnswers,
      incorrectAnswers
    });

    // Update User statistics
    const user = await User.findById(req.user.id);
    if (user) {
      const oldQuizzesTaken = user.quizzesTaken || 0;
      const oldAccuracy = user.accuracy || 0;
      
      user.quizzesTaken = oldQuizzesTaken + 1;
      user.xp += xpGained;
      
      // Rolling average for accuracy
      user.accuracy = Math.round(((oldAccuracy * oldQuizzesTaken) + attemptAccuracy) / user.quizzesTaken);
      
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        attempt,
        attemptAccuracy,
        userNewStats: {
          xp: user.xp,
          quizzesTaken: user.quizzesTaken,
          accuracy: user.accuracy
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/attempts/my
// @access  Private
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate('quiz', 'title category difficulty')
      .sort('-completedAt');

    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
