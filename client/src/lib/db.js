import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizapp';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB Connected (Cached connection initialized)');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Database connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
