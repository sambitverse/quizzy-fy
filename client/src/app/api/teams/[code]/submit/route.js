import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import Team from '../../../../../lib/models/Team';
import { getAuthUser } from '../../../../../lib/auth';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { code } = resolvedParams;
    const uppercaseCode = code.trim().toUpperCase();

    const { score, maxScore } = await req.json();
    if (score === undefined || maxScore === undefined) {
      return NextResponse.json({ success: false, message: 'Please provide score and maxScore' }, { status: 400 });
    }

    const team = await Team.findOne({ code: uppercaseCode });
    if (!team) {
      return NextResponse.json({ success: false, message: 'Team lobby not found' }, { status: 404 });
    }

    // Verify user is member of the team
    if (!team.members.includes(user._id)) {
      return NextResponse.json({ success: false, message: 'You are not a member of this team' }, { status: 403 });
    }

    // Update or insert member score
    const existingScoreIdx = team.scores.findIndex(
      (s) => s.user.toString() === user._id.toString()
    );

    if (existingScoreIdx > -1) {
      team.scores[existingScoreIdx].score = score;
      team.scores[existingScoreIdx].maxScore = maxScore;
      team.scores[existingScoreIdx].completedAt = new Date();
    } else {
      team.scores.push({
        user: user._id,
        score,
        maxScore,
        completedAt: new Date()
      });
    }

    await team.save();

    // Fetch team again populated to return updated values
    const updatedTeam = await Team.findOne({ code: uppercaseCode })
      .populate('members', 'username xp accuracy')
      .populate('quiz', 'title category difficulty questions')
      .populate('creator', 'username')
      .populate('scores.user', 'username');

    return NextResponse.json({ success: true, data: updatedTeam });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
