import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Team from '../../../lib/models/Team';
import Quiz from '../../../lib/models/Quiz';
import { getAuthUser } from '../../../lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const { name, quizId } = await req.json();
    if (!name || !quizId) {
      return NextResponse.json({ success: false, message: 'Please provide a team name and select a quiz' }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
    }

    // Generate unique room code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingTeam = await Team.findOne({ code });
      if (!existingTeam) {
        isUnique = true;
      }
    }

    const team = await Team.create({
      name,
      code,
      quiz: quizId,
      creator: user._id,
      members: [user._id]
    });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    // Find all teams the user is currently a member of
    const teams = await Team.find({ members: user._id })
      .populate('quiz', 'title category difficulty')
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

