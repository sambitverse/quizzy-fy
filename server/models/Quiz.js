const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please add a question text']
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length >= 2;
      },
      message: 'A question must have at least 2 options.'
    },
    required: true
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, 'Please specify the correct answer index']
  },
  points: {
    type: Number,
    default: 10
  },
  timeLimit: {
    type: Number,
    default: 20 // seconds per question
  },
  explanation: {
    type: String,
    default: ''
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Please select difficulty'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
