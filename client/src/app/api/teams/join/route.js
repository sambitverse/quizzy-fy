import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Team from '../../../../lib/models/Team';
import { getAuthUser } from '../../../../lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, message: 'Please provide a team code' }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const team = await Team.findOne({ code: uppercaseCode });

    if (!team) {
      return NextResponse.json({ success: false, message: 'Invalid team code. No lobby found.' }, { status: 404 });
    }

    // If user is not already in the team members, add them
    if (!team.members.includes(user._id)) {
      team.members.push(user._id);
      await team.save();
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
