import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Team from '../../../../lib/models/Team';
import Quiz from '../../../../lib/models/Quiz';
import User from '../../../../lib/models/User';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { code } = resolvedParams;
    const uppercaseCode = code.trim().toUpperCase();

    // Fetch team and populate creator, members, quiz details, and score creators
    const team = await Team.findOne({ code: uppercaseCode })
      .populate('members', 'username xp accuracy')
      .populate('quiz', 'title category difficulty questions')
      .populate('creator', 'username')
      .populate('scores.user', 'username');

    if (!team) {
      return NextResponse.json({ success: false, message: 'Lobby not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
