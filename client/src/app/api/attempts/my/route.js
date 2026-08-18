import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Attempt from '../../../../lib/models/Attempt';
import Quiz from '../../../../lib/models/Quiz'; // Needed for populate
import { getAuthUser } from '../../../../lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const attempts = await Attempt.find({ user: user._id })
      .populate('quiz', 'title category difficulty')
      .sort('-completedAt');

    return NextResponse.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
