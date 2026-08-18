import mongoose from 'mongoose';

const TeamScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true,
    maxlength: [40, 'Team name cannot be more than 40 characters']
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  scores: [TeamScoreSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
