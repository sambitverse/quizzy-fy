import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Attempt from '../../../lib/models/Attempt';
import Quiz from '../../../lib/models/Quiz';
import User from '../../../lib/models/User';
import { getAuthUser } from '../../../lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const { quizId, answers } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, message: 'Invalid format for answers' }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    let maxScore = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

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

    const xpGained = score;
    const totalQuestions = quiz.questions.length;
    const attemptAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Create the attempt record
    const attempt = await Attempt.create({
      user: user._id,
      quiz: quizId,
      score,
      maxScore,
      xpGained,
      correctAnswers,
      incorrectAnswers
    });

    // Update User model statistics
    const userModelObj = await User.findById(user._id);
    if (userModelObj) {
      const oldQuizzesTaken = userModelObj.quizzesTaken || 0;
      const oldAccuracy = userModelObj.accuracy || 0;

      userModelObj.quizzesTaken = oldQuizzesTaken + 1;
      userModelObj.xp += xpGained;
      userModelObj.accuracy = Math.round(((oldAccuracy * oldQuizzesTaken) + attemptAccuracy) / userModelObj.quizzesTaken);

      await userModelObj.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        attempt,
        attemptAccuracy,
        userNewStats: {
          xp: userModelObj.xp,
          quizzesTaken: userModelObj.quizzesTaken,
          accuracy: userModelObj.accuracy
        }
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
