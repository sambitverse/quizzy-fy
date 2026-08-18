import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Quiz from '../../../../lib/models/Quiz';
import User from '../../../../lib/models/User';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const quiz = await Quiz.findById(id).populate('creator', 'username');
    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
    }

    // Verify creator ownership or Admin rights
    if (quiz.creator.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ success: false, message: 'Not authorized to delete this quiz' }, { status: 401 });
    }

    await quiz.deleteOne();
    return NextResponse.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
