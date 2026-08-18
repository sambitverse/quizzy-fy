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
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: 'Please enter all fields' }, { status: 400 });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          message: userExists.email === email ? 'Email already in use' : 'Username already taken'
        },
        { status: 400 }
      );
    }

    // Create user (pre-save hook will hash password)
    const user = await User.create({
      username,
      email,
      password
    });

    return NextResponse.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      quizzesTaken: user.quizzesTaken,
      accuracy: user.accuracy,
      token: generateToken(user._id)
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
