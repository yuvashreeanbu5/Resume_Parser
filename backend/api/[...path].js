import { connectToDatabase } from "../src/database.js";
import app from "../src/server.js";

export default async function handler(request, response) {
  try {
    await connectToDatabase();
    return app(request, response);
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
    return response.status(503).json({ message: "The database is temporarily unavailable." });
  }
}
