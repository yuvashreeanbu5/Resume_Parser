import { connectToDatabase } from "../config/database.js";

export function createDatabaseConnectionMiddleware(connect = connectToDatabase) {
  return async function ensureDatabaseConnection(_request, response, next) {
    try {
      await connect();
      next();
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      response.status(503).json({
        message:
          "Database unavailable. Check the backend MONGODB_URI and MongoDB network access settings.",
      });
    }
  };
}

export const ensureDatabaseConnection = createDatabaseConnectionMiddleware();
