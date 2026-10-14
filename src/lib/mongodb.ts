// ============================================================
// CraveBox – Server-Only MongoDB Connection with Caching
// Target Database: cravebox (MongoDB Atlas)
// Prevents connection churn across Next.js API invocations
// ============================================================

import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseConnectionCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseConnectionCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseConnectionCache) {
  global.mongooseConnectionCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Please configure it in .env.local to enable database connectivity."
    );
  }

  // Return existing cached connection if active
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: "cravebox", // Explicitly connect to cravebox database
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas cluster is unreachable
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    // Log safe error without exposing connection string credentials
    const safeMsg = error instanceof Error ? error.message : "Unknown database connection error";
    throw new Error(`MongoDB Atlas connection error: ${safeMsg}`);
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
