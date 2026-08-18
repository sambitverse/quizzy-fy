import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authorized to access this route' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        quizzesTaken: user.quizzesTaken,
        accuracy: user.accuracy
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
