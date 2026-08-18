const Quiz = require('../models/Quiz');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
exports.getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};

    if (category) {
      query.category = new RegExp(category, 'i');
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (search) {
      query.title = new RegExp(search, 'i');
    }

    const quizzes = await Quiz.find(query)
      .populate('creator', 'username')
      .select('-questions.correctAnswerIndex -questions.explanation'); // Hide answers for lists
      
    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single quiz (with correct answers/explanations if authenticated)
// @route   GET /api/quizzes/:id
// @access  Public/Private
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'username');
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one question' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      questions,
      creator: req.user.id
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Make sure user is quiz creator
    if (quiz.creator.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
