import jwt from 'jsonwebtoken';
import dbConnect from './db';
import User from './models/User';

export async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey12345');
    await dbConnect();
    const user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return null;
  }
}
