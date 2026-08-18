import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../lib/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const users = await User.find()
      .select('username xp quizzesTaken accuracy')
      .sort({ xp: -1 })
      .limit(10);

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
