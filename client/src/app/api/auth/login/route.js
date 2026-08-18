import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey12345', {
    expiresIn: '30d'
  });
};

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please enter email and password' }, { status: 400 });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return NextResponse.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        quizzesTaken: user.quizzesTaken,
        accuracy: user.accuracy,
        token: generateToken(user._id)
      });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
