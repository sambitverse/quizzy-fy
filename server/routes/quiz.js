const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, createQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getQuizzes)
  .post(protect, createQuiz);

router.route('/:id')
  .get(getQuizById)
  .delete(protect, deleteQuiz);

module.exports = router;
