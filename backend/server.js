import "./config/env.js";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { connectToDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import analysisRouter from "./routers/analysisRouter.js";
import healthRouter from "./routers/healthRouter.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);
app.use("/api/health", healthRouter);
app.use("/api/analyses", analysisRouter);
app.use(notFound);
app.use(errorHandler);

export async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Configure it in backend/.env.");
  }

  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number.");
  }
  const host = process.env.HOST || "127.0.0.1";

  await connectToDatabase();
  const server = await new Promise((resolveServer, reject) => {
    const listener = app.listen(port, host, () => resolveServer(listener));
    listener.once("error", reject);
  });
  console.info(`Resume evaluator API listening at http://${host}:${port}.`);

  async function shutdown(signal) {
    console.info(`${signal} received; shutting down.`);
    server.close(async (error) => {
      if (error) {
        console.error("HTTP server shutdown failed:", error);
        process.exitCode = 1;
      }
      await mongoose.disconnect();
    });
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer().catch(async (error) => {
    console.error("Could not start the API server:", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

export default app;
