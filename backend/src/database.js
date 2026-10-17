import mongoose from "mongoose";

let connectionPromise;

mongoose.connection.on("disconnected", () => {
  connectionPromise = undefined;
});

export function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return Promise.reject(
      new Error("MONGODB_URI is required. Configure it in backend/.env or Vercel environment variables."),
    );
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}
