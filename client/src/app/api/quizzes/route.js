import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Quiz from '../../../lib/models/Quiz';
import User from '../../../lib/models/User';
import { getAuthUser } from '../../../lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

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
      .select('-questions.correctAnswerIndex -questions.explanation');

    return NextResponse.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const { title, description, category, difficulty, questions } = await req.json();

    if (!questions || questions.length === 0) {
      return NextResponse.json({ success: false, message: 'Please add at least one question' }, { status: 400 });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      questions,
      creator: user._id
    });

    return NextResponse.json({ success: true, data: quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
